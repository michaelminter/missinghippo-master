require 'sinatra'
require 'data_mapper' # requires all the gems listed above
require 'json'
require 'cloudinary'
require './config/database'
require 'pdfkit'
require 'rest_client'
require 'pony'
require 'nokogiri'
require 'net/http'
require 'open-uri'
require 'sanitize'
require 'uri'
require 'twilio-ruby'

use PDFKit::Middleware

enable :logging
use Rack::Logger

Dir.glob('lib/tasks/*.rake').each { |r| import r }

configure :development do
  Cloudinary.config do |config|
    config.cloud_name = ENV[:cloudinary_name]
    config.api_key    = ENV[:cloudinary_key]
    config.api_secret = ENV[:cloudinary_secret]
  end
  CLOUDINARY_URL=ENV[:cloudinary_url]
end

configure :production do
  require 'newrelic_rpm'
end

PDFKit.configure do |config|
  config.default_options = {
      :page_size     => 'Letter',
      :margin_top    => '0.4in',
      :margin_right  => '0.5in',
      :margin_bottom => '0in',
      :margin_left   => '0.5in'
  }
end

helpers do
  def relative_time(start_time=DateTime.now.strftime('%m/%d/%Y-%H:%M:%S'))
    start_time   = Time.parse(start_time.to_s)
    diff_seconds = Time.now - start_time
    puts start_time
    case diff_seconds
      when 0 .. 59
        value = diff_seconds
        range = ' seconds ago'
      when 60 .. (3600-1)
        value = diff_seconds/60
        range = ' minutes ago'
      when 3600 .. (3600*24-1)
        value = diff_seconds/3600
        range = ' hours ago'
      when (3600*24) .. (3600*24*30)
        value = diff_seconds/(3600*24)
        range = ' days ago'
      else
        value = start_time.strftime('%m/%d/%Y')
        range = ' - format incorrect'
    end
    "#{value.to_i} #{range}"
  end
end

get '/' do
  redirect '/mobile' if request.env['HTTP_USER_AGENT'] =~ /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i

  articles = load_articles

  # @articles = {}
  # articles.each do |article|
  #   @articles[article.xpath('title').text] = Sanitize.clean(article.xpath('description').text) + " <a href=\"#{article.xpath('link').text}\" target=\"_blank\" title=\"#{article.xpath('title').text}\">Read More</a>"
  # end

  erb :index, :layout => 'layouts/application'.to_sym
end

get '/index2' do
  redirect '/mobile' if request.env['HTTP_USER_AGENT'] =~ /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i

  articles = load_articles

  @articles = {}
  articles.each do |article|
    @articles[article.xpath('title').text] = Sanitize.clean(article.xpath('description').text) + " <a href=\"#{article.xpath('link').text}\" target=\"_blank\" title=\"#{article.xpath('title').text}\">Read More</a>"
  end

  erb :index, :layout => 'layouts/application_b'.to_sym
end

get '/network' do
  @network = User.all
  erb :network, :layout => :layout
end

get '/preview' do
  @poster = Poster.new(params[:poster])

  @preview = true

  erb :preview, :layout => 'layouts/original'.to_sym
end

get '/preview.pdf' do
  @poster = Poster.new(params[:poster])

  @preview = true

  uri = params[:poster].map{ |k,v| "poster[#{k}]=#{v}" }.join('&')
  url = "/preview?#{uri}"
  kit = PDFKit.new(url, :page_size => 'Letter')
  pdf = kit.to_pdf
end

get '/mobile' do
  articles = load_articles

  @articles = {}
  articles.each do |article|
    @articles[article.xpath('title').text] = Sanitize.clean(article.xpath('description').text) + " <a href=\"#{article.xpath('link').text}\" target=\"_blank\" title=\"#{article.xpath('title').text}\">Read More</a>"
  end

  erb :mobile, :layout => 'layouts/mobile'.to_sym
end

get '/r/:id' do
  report = Report.get(params[:id].to_i)
  redirect "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=#{report.email.gsub('@','%40').gsub('.','%2e')}&lc=US&item_name=#{report.name.gsub(' ','%20')}&no_note=0&currency_code=USD&bn=PP%2dDonationsBF%3areward%2dfinder%2epng%3aNonHostedGuest"
end

get '/unsubscribe/:email/:auth_key' do
  # TODO: add auth_key to users table and write code for ubsubscribing
end

get '/admin/reports/:id/delete' do
  poster = Report.get(params[:id])
  poster.destroy

  redirect '/admin/reports'
end

get '/admin/fliers/:id/delete' do
  poster = Poster.get(params[:id].to_i)
  poster.destroy

  redirect '/admin/posters'
end

get '/:uri.:format' do
  @poster = Poster.first(:uri => params[:uri])
  layout  = Layout.get(1)

  case params[:format]
    when 'html'
      erb :uri, :layout => 'layouts/original'.to_sym
    when 'pdf'
      url = "/#{@poster.uri}.html"
      kit = PDFKit.new(url, :page_size => 'Letter')
      pdf = kit.to_pdf
    else
      erb :uri, :layout => 'layouts/original'.to_sym
  end
end

get '/:uri' do
  @poster = Poster.first(:uri => params[:uri])
  layout  = Layout.get(1)

  erb :uri, :layout => 'layouts/original'.to_sym
end

post '/' do
  content_type :json

  if params[:image]
    upload = Cloudinary::Uploader.upload(File.open(params[:image][:tempfile]))
  end
  #{"public_id"=>"tzvmzdbrbu2oe2s4dbr4",
  # "version"=>1370128250,
  # "signature"=>"bb0e8e7f8a15d234797f1c7c71de4883fcfde167",
  # "width"=>462,
  # "height"=>580,
  # "format"=>"jpg",
  # "resource_type"=>"image",
  # "created_at"=>"2013-06-01T23:10:50Z",
  # "bytes"=>56908,
  # "type"=>"upload",
  # "url"=>"http://res.cloudinary.com/hfnqsrwbp/image/upload/v1370128250/tzvmzdbrbu2oe2s4dbr4.jpg",
  # "secure_url"=>"https://cloudinary-a.akamaihd.net/hfnqsrwbp/image/upload/v1370128250/tzvmzdbrbu2oe2s4dbr4.jpg"
  #}

  if params['join_network'] && params['join_network'] == 'true'
    user = User.new(
        :latitude       => params[:latitude],
        :longitude      => params[:longitude],
        :first_name     => params[:contact_name].split(' ')[0],
        :last_name      => params[:contact_name].split(' ')[1],
        :email          => params[:contact_email],
        :street_address => params[:street_address],
        :city           => params[:city],
        :zip_code       => params[:zip_code],
        :state          => params[:state],
        :country        => params[:country],
        :phone_number   => params[:contact_phone],
        :source         => 'opt_in_through_flier',
        :created_at     => Time.now
    )
    user.save rescue ''
  end

  @poster = Poster.new(
      :uri            => '',
      :street_address => params[:street_address],
      :city           => params[:city],
      :state          => params[:state],
      :zip_code       => params[:zip_code].to_i,
      :country        => params[:country],

      :latitude      => params[:latitude],
      :longitude     => params[:longitude],

      :contact_name  => params[:contact_name],
      :contact_phone => params[:contact_phone],
      :contact_email => params[:contact_email],

      :layout_id     => params[:layout_id].to_i,
      :name          => params[:name],
      :type          => params[:type],
      :breed         => params[:breed],
      :gender        => params[:gender].to_i,
      :age           => params[:age],
      :color         => params[:color],
      :note          => params[:note],
      :location      => params[:location],
      :reward        => params[:reward],

      :created_at    => Time.now
  )

  if params[:image]
    @poster.image_id     = upload['public_id']
    @poster.image_format = upload['format']
    @poster.image_url    = upload['url']
  end

  if @poster.save
    if @poster.update(:uri => @poster.id.to_s(36))
      @poster.to_json
    else
      { :errors => 'Not a valid URL format' }.to_json
    end
  else
    { :errors => @poster.errors.full_messages }.to_json
  end
end

post '/join' do
  user = User.new(params)
  user.save

  return :text => 'nothing'
end

post '/contact' do
  if ENV['RACK_ENV'] == 'production'
    options = {
        :from        => 'Missing Hippo <michael@missinghippo.com>',
        :to          => 'michael@missinghippo.com',
        :subject     => 'In-Page Message',
        :html_body   => "#{params[:message]}<br /><br />-- #{params[:name]} <#{params[:email]}>",
        :body        => params[:message],
        :port        => '587',
        :via         => :smtp,
        :via_options => {
            :address              => 'smtp.sendgrid.net',
            :port                 => '587',
            :enable_starttls_auto => true,
            :user_name            => ENV['SENDGRID_USERNAME'],
            :password             => ENV['SENDGRID_PASSWORD'],
            :authentication       => :plain,
            :domain               => 'heroku.com'
        }
    }
    Pony.mail(options)
  end
  return { message: 'sent' }.to_json
end

post '/api/v1/locations' do
  # https://developers.google.com/places/documentation/search
  # https://developers.google.com/places/training/additional-places-features
  content_type :json

  request = {}

  #params[:options].each do |option|
  #  request[option] = JSON.parse RestClient.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json?&location=#{params[:latitude]},#{params[:longitude]}&radius=6000&sensor=true&keyword=#{option.gsub('_','%20')}&key=AIzaSyBjoUy3cpsy-_BIgTLI4QytjRy_B_AIfjg")
  #end

  required_parameters = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?&location=#{params[:latitude]},#{params[:longitude]}&radius=4828&sensor=true&key=#{ENV[:google_api_key]}"

  request['veterinary_clinics'] = JSON.parse RestClient.get(required_parameters + '&types=veterinary_care')
  request['pet_stores']         = JSON.parse RestClient.get(required_parameters + '&types=pet_store')
  request['animal_shelters']    = JSON.parse RestClient.get(required_parameters + '&keyword=%22animal%20shelter%22')
  # request['animal_boarding']    = JSON.parse RestClient.get(required_parameters + "&keyword=%22animal%20boarding%22")
  # request['dog_grooming']       = JSON.parse RestClient.get(required_parameters + "&keyword=%22dog%20grooming%22")

  return request.to_json
end

post '/api/v1/pets' do
  content_type :json
  latitude  = params[:latitude].to_f
  longitude = params[:longitude].to_f
  distance  = params[:distance].to_i

  pets = []

  Poster.all.each do |poster|
    pets << poster if haversine(latitude, longitude, poster.latitude.to_f, poster.longitude.to_f) < 15.0
  end
  return pets.to_json
end

post '/api/v1/report/:id/:type' do
  content_type :json

  poster = Poster.get(params[:id].to_i)

  if params[:image]
    upload = Cloudinary::Uploader.upload(File.open(params[:image][:tempfile]))
    #if something
      photo = Photo.create({ :cloudinary_id => upload['public_id'], :format => upload['format'] })
    #end
  end
  report = Report.create({ :flier_id => poster.id, :type => params[:type], :name => params[:name], :email => params[:email], :phone => params[:phone], :details => params[:details], :photo_id => (photo.id rescue nil) })
  report.to_json
end

post '/api/v1/location/:reference' do
  content_type :json

  request = JSON.parse RestClient.get("https://maps.googleapis.com/maps/api/place/details/json?reference=#{params[:reference]}&sensor=true&key=#{ENV[:google_api_key]}")

  return request.to_json
end

get '/admin/posters' do
  @posters = Poster.all
  erb :posters, :layout => :layout
end

get '/admin/users' do
  @users = User.all
  erb :users, :layout => :layout
end

get '/admin/reports' do
  @reports = Report.all
  erb :reports, :layout => :layout
end

get '/admin/photos' do
  @photos = Photo.all
  erb :photos, :layout => :layout
end

get '/admin/users/:id/delete' do
  user = User.get(params[:id].to_i)
  user.destroy

  redirect '/admin/users'
end

def load_articles
  # get XML feed
  uri      = URI.parse('http://www.iheartpaws.com/articlerss.php')
  http     = Net::HTTP.new(uri.host, uri.port)
  request  = Net::HTTP::Get.new(uri.request_uri)
  response = http.request(request)

  # parse XML
  doc = Nokogiri::XML(response.body)

  # find articles in XML
  return doc.xpath('//item')
end

def haversine(lat1, long1, lat2, long2, distance=3959)
  dtor = Math::PI/180
  r = distance # defaults to miles
  # 6378.14*1000 => meters
  # 6378.14 => kilometers

  rlat1  = lat1 * dtor
  rlong1 = long1 * dtor
  rlat2  = lat2 * dtor
  rlong2 = long2 * dtor

  dlon = rlong1 - rlong2
  dlat = rlat1 - rlat2

  a = power(Math::sin(dlat/2), 2) + Math::cos(rlat1) * Math::cos(rlat2) * power(Math::sin(dlon/2), 2)
  c = 2 * Math::atan2(Math::sqrt(a), Math::sqrt(1-a))
  d = r * c

  return d
end

def power(num, pow)
  num ** pow
end

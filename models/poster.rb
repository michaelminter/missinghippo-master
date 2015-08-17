class Poster
  include DataMapper::Resource

  property :id,             Serial
  property :uri,            String
  property :street_address, String
  property :city,           String
  property :state,          String
  property :zip_code,       Integer
  property :country,        String

  property :latitude,       String, :required => true
  property :longitude,      String, :required => true

  property :found,          Boolean, :default => false

  property :layout_id,      Integer, :default => 1
  property :type,           Integer, :default => 3
  property :name,           String, :required => true
  property :breed,          String
  property :gender,         Integer
  property :age,            String
  property :color,          String
  property :location,       Text
  property :note,           Text
  property :reward,         Boolean, :default => false

  property :image_id,       String
  property :image_format,   String
  property :image_url,      Text

  property :contact_name,   String
  property :contact_phone,  String
  property :contact_email,  String, :required => true

  property :source,         String
  property :auth_key,       Text # for removing flier
  property :created_at,     DateTime

  #validates_presence_of :street_address, :if => lambda { |t| t.latitude.blank? }
  #validates_presence_of :city,           :if => lambda { |t| t.latitude.blank? }
  #validates_presence_of :zip_code,       :if => lambda { |t| t.latitude.blank? }
  #validates_presence_of :country,        :if => lambda { |t| t.latitude.blank? }

  # has n, :reports

  before :valid?,  :find_lat_long
  before :save,    :create_auth_key
  before :destroy, :delete_cl_image

  after  :update,  :send_notifications
  after  :update,  :send_network_notifications

  def send_notifications
    send_email unless self.contact_email.blank?
    send_text_message unless self.contact_phone.blank?
  end

  def send_network_notifications
    send_network_email
    send_network_text_message
  end

  def find_lat_long
    if  self.latitude.nil? && self.longitude.nil? && !self.street_address.nil?
      url = "https://maps.googleapis.com/maps/api/geocode/json?address=#{self.street_address.to_s.gsub(' ','%20')},%20#{self.city.to_s.gsub(' ','%20')},%20#{self.state.to_s.gsub(' ','%20')},%20#{self.zip_code.to_s.gsub(' ','%20')}&sensor=false"
      geocode = JSON.parse RestClient.get(url)

      self.latitude  = geocode['results'][0]['geometry']['viewport']['northeast']['lat'].to_s
      self.longitude = geocode['results'][0]['geometry']['viewport']['northeast']['lng'].to_s
    end
  end

  def create_auth_key
    self.auth_key = Digest::MD5.hexdigest Time.now.to_s
  end

  def send_email
    html_content = "This email is to confirm you have created a Missing Pet flier at <a href=\"http://missinghippo.com\">missinghippo.com</a>.<br /><br />"

    html_content += "Would you like to <strong>increase the reach</strong> of your missing pet's digital flier? Donate to Missing Hippo today and we'll send daily notifications to our members until your pet is found, publish a search on our Twitter and Facebook networks, and increase the size of your pet's digital flier icon on <a href=\"http://missinghippo.com\">missinghippo.com</a>.<br /><br />"

    html_content += "<a href=\"https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=mothore%40gmail%2ecom&lc=US&item_name=Missing%20Hippo%20Donation&item_number=0001&amount=10%2e00&currency_code=USD&button_subtype=services&no_note=0&bn=PP%2dBuyNowBF%3aenlarge%2dicon%2dbutton%2epng%3aNonHostedGuest\" target=\"_blank\"><img src=\"http://missinghippo.com/image/upgrade.png\" /></a><br /><br />"

    #html_content += "You can preview your flier at:<br />"
    #html_content += "<a href=\"http://missinghippo.com/#{self.uri}.html\">http://missinghippo.com/#{self.uri}.html</a><br /><br />"

    #html_content += "Download the PDF at:<br />"
    #html_content += "<a href=\"http://missinghippo.com/#{self.uri}.pdf\">http://missinghippo.com/#{self.uri}.pdf</a><br /><br />"

    html_content += "If your pet is found, you can wait for your flier to expire in two weeks, or delete it here:<br />"
    html_content += "<a href=\"http://missinghippo.com/#{self.uri}/remove/#{self.auth_key}\">http://missinghippo.com/#{self.uri}/remove/#{self.auth_key}</a>"



    text_content = "This email is to confirm you have created a Missing Pet flier at http://missinghippo.com\n\n"

    text_content += "Would you like to increase the reach of your missing pet's digital flier? Donate to Missing Hippo today and we'll send daily notifications to our members until your pet is found, publish a search on our Twitter and Facebook networks, and increase the size of your pet's digital flier icon on http://missinghippo.com.\n\n"

    text_content += "https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=mothore%40gmail%2ecom&lc=US&item_name=Missing%20Hippo%20Donation&item_number=0001&amount=10%2e00&currency_code=USD&button_subtype=services&no_note=0&bn=PP%2dBuyNowBF%3aenlarge%2dicon%2dbutton%2epng%3aNonHostedGuest\n\n"

    #text_content += "Preview your flier at:\n"
    #text_content += "http://missinghippo.com/#{self.uri}\n\n"

    #text_content += "Download the PDF at:\n"
    #text_content += "http://missinghippo.com/#{self.uri}.pdf\n\n"

    text_content += "If your pet is found, you can wait for your flier to expire in two weeks, or delete it here:\n"
    text_content += "http://missinghippo.com/#{self.uri}/remove/#{self.auth_key}"

    options = {
        :from        => 'Missing Hippo <michael@missinghippo.com>',
        :to          => self.contact_email,
        :subject     => 'Confirmation',
        :html_body   => html_content,
        :body        => text_content,
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
    begin
      Pony.mail(options)
    rescue => ex
      puts ex.message
    end
  end

  def send_text_message
    @client = Twilio::REST::Client.new ENV['TWILIO_ACCOUNT_SID'], ENV['TWILIO_AUTH_TOKEN']

    @client.account.messages.create(
        :from => '+17147708060',
        :to   => self.contact_phone,
        # :body => "Download:\nhttp://missinghippo.com/#{self.uri}.pdf\n\nRemove:\nhttp://missinghippo.com/#{self.uri}/remove/#{self.auth_key}"
        :body => 'You will be contacted at this number when somebody responds to your missing pet flier'
    )
  end

  def send_network_email
    # find all users in 5 mile radius
    sql = "SELECT email, distance FROM (SELECT email, ((ACOS(SIN(#{self.latitude} * PI() / 180) * SIN(CAST(u.latitude AS DECIMAL(10,6)) * PI() / 180) + COS(#{self.latitude} * PI() / 180) * COS(CAST(u.latitude AS DECIMAL(10,6)) * PI() / 180) * COS((#{self.longitude} - CAST(u.longitude AS DECIMAL(10,6))) * PI() / 180)) * 180 / PI()) * 60 * 1.1515) as distance FROM users u ) d WHERE distance <= 5 ORDER BY distance ASC;"

    nearby = repository.adapter.select(sql)

    nearby.each do |user|
      notify_nearby_user(user)
      # TODO: add text message capability
    end
  end

  def send_network_text_message
    # do something
  end

  def notify_nearby_user(user)
    html_content = 'Check out <a href="http://missinghippo.com" target="_blank" title="Missing Hippo">missinghippo.com</a> to see a new missing pet in your neighborhood.'
    text_content = 'Check out http://missinghippo.com to see a new missing pet in your neighborhood.'

    options = {
        :from        => 'Missing Hippo <michael@missinghippo.com>',
        :to          => user.email,
        :subject     => 'New Missing Pet in Your Area',
        :html_body   => html_content,
        :body        => text_content,
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
    begin
      Pony.mail(options)
    rescue => ex
      puts ex.message
    end
  end

  def delete_cl_image
    Cloudinary::Api.delete_resources([self.image_id])
  end

  def contact_gravatar_url(width=50)
    "http://www.gravatar.com/avatar/#{Digest::MD5.hexdigest(self.contact_email)}.jpg?s=#{width}&d=identicon"
  end
end

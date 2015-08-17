class User
  include DataMapper::Resource

  property :id,             Serial
  property :email,          String, :required => true, :unique => true
  property :zip_code,       String, :required => true
  property :first_name,     String
  property :last_name,      String

  property :street_address, String
  property :city,           String
  property :state,          String
  property :country,        String

  # TODO: Change property to Decimal
  property :latitude,       String
  property :longitude,      String

  property :phone_number,   String, :unique => true

  property :auth_key,       Text

  property :source,         String

  property :created_at,     DateTime

  validates_presence_of :email
  validates_presence_of :zip_code

  before :valid?, :assign_lat_long
  before :valid?, :assign_auth_key

  after :save, :send_email_confirmation

  # TODO: Verification_token, verified

  def assign_lat_long
    if  self.latitude.nil? && self.longitude.nil? && !self.street_address.nil?
      address = []
      address << "#{self.street_address}" unless self.street_address.nil?
      address << ", #{self.city}"         unless self.city.nil?
      address << ", #{self.state}"        unless self.state.nil?
      address << "#{self.zip_code}"       unless self.zip_code.nil?

      address_str = address.join(' ').gsub(' ,',',').gsub(' ','%20').gsub('#','%23').gsub('&','%26')

      url = "https://maps.googleapis.com/maps/api/geocode/json?address=#{address_str}&sensor=false"
      geocode = JSON.parse RestClient.get(url)

      if geocode['status'] == 'OK'
        self.latitude  = geocode['results'][0]['geometry']['viewport']['northeast']['lat'].to_s
        self.longitude = geocode['results'][0]['geometry']['viewport']['northeast']['lng'].to_s
      end
    end
  end

  def assign_auth_key
    self.auth_key = Digest::MD5.hexdigest Time.now.to_s
  end

  def send_email_confirmation
    html_content = "Hi #{self.first_name},<br /><br />"
    html_content += "Thank you for joining the <strong>Missing Hippo Network</strong>.<br /><br />"
    html_content += "Visit us any time at <a href=\"http://missinghippo.com\" target=\"_blank\">missinghippo.com</a><br /><br />"
    html_content += "Sincerely,<br /><br />"
    html_content += "<strong>Michael Minter</strong><br />"
    html_content += "Owner"

    text_content = "Hi #{self.first_name},\n\n"
    text_content += "Thank you for joining the Missing Hippo Network.\n\n"
    text_content += "Visit us any time at http://missinghippo.com\n\n"
    text_content += "Sincerely,\n\n"
    text_content += "Michael Minter\n"
    text_content += "Owner"

    options = {
      :from        => "Missing Hippo <michael@missinghippo.com>",
      :to          => self.email,
      :subject     => "You have joined the Missing Hippo Network",
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
    Pony.mail(options)
  end

  def find_by_zip_codes(zip_codes)
    return User.find_by_sql("SELECT * FROM newsletter WHERE zip_code IN (#{zip_codes.join(',')});")
  end

  def self.users_by_distance(zip_code, miles=3)
    api_addy = "http://zipcodedistanceapi.redline13.com/rest/putyourapikeyhere/radius.json/#{zip_code}/#{miles}/mile"

    request = JSON.parse RestClient.get(api_addy)

    zip_codes = request['zip_codes'].map { |code| code['zip_code'] }.join(',')

    users = DataMapper.repository(:default).adapter.select("SELECT * FROM newsletters WHERE zip_code IN (#{zip_codes});")

    return users
  end

  def gravatar_url(width=50)
    "http://www.gravatar.com/avatar/#{Digest::MD5.hexdigest(self.email)}.jpg?s=#{width}&d=identicon"
  end
end

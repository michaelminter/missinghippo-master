class Report
  include DataMapper::Resource

  property :id,             Serial
  property :type,           String
  property :flier_id,       Integer
  property :latitude,       String
  property :longitude,      String

  property :name,           String, :required => true
  property :email,          String
  property :phone,          String

  property :details,        Text
  property :photo_id,       Integer

  property :created_at,     DateTime

  # has 1, :photo
  # belongs_to :flier, :model => 'Poster'

  after :create, :send_notifications

  def flier
    Poster.get(self.flier_id)
  end

  def photo
    Photo.get(self.photo_id)
  end

  def send_notifications
    send_email unless self.email.blank?
    send_text_message unless self.email.blank?
  end

  def send_email
    flier = Poster.get(self.flier_id.to_i)

    html_content = "Your pet has been #{(self.type == 'sighting' ? 'spotted' : 'found')}.<br /><br />"
    html_content += 'Details:<br />'
    html_content += "<strong>#{self.details}</strong><br /><br />"
    html_content += 'For more information, contact:<br />'
    html_content += "<strong>#{self.name}</strong><br />"
    html_content += "E: #{self.email}<br />"
    html_content += "P: #{self.phone}"
    html_content += (flier.reward ? "<br /><br /><a href=\"http://missinghippo.com/r/#{self.id}\"><img src=\"http://missinghippo.com/image/reward-finder.png\" /></a>" : '')

    text_content = "Your pet has been #{(self.type == 'sighting' ? 'spotted' : 'found')}.\n\n"
    text_content += "Details:\n\n"
    text_content += "#{self.details}\n\n"
    text_content += "For more information, contact:\n\n"
    text_content += "<strong>#{self.name}\n"
    text_content += "E: #{self.email}\n"
    text_content += "P: #{self.phone}"
    text_content += (flier.reward ? "\n\nReward: http://missinghippo.com/r/#{self.id}" : '')

    options = {
        :from        => "Missing Hippo <michael@missinghippo.com>",
        :to          => flier.contact_email,
        :subject     => "Your missing pet has been #{(self.type == 'sighting' ? 'sighted' : 'found')}",
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
    #if ENV['RACK_ENV'] == 'production'
      flier = Poster.get(self.flier_id.to_i)

      unless flier.contact_phone.blank?
        @client = Twilio::REST::Client.new ENV['TWILIO_ACCOUNT_SID'], ENV['TWILIO_AUTH_TOKEN']

        @client.account.messages.create(
            :from => '+17147708060',
            :to   => flier.contact_phone,
            :body => "Your pet has been #{(self.type == 'sighting' ? 'spotted' : 'found')}.\n\n#{(self.email.blank? ? '' : "E: #{self.email}\n")}#{(self.phone.blank? ? '' : "P: #{self.phone}")}#{flier.reward ? "\n\nReward: http://missinghippo.com/r/#{self.id}" : ''}"
        )
      end
    #end
  end
end
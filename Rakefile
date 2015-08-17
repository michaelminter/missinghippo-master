require 'rubygems'
require 'sinatra'
require 'data_mapper'
require 'json'
require 'rest_client'
require 'pony'
require 'twilio-ruby'
require './config/database'

namespace :db do
  desc 'Create Database'
  task :create do
    DataMapper.auto_migrate!
  end

  desc 'Load seed data'
  task :seed do
    DataMapper.auto_migrate!
    puts "Migrated Database"

    DataMapper.repository(:default).adapter.execute("TRUNCATE layouts RESTART IDENTITY CASCADE;")

    if Layout.create(:name => 'Original', :file_name => 'original')
      puts "Created Layout:Original"
    end
  end

  desc 'Migrate database'
  task :migrate do
    DataMapper.auto_migrate!
    puts "Migrated Database"
  end
end

desc "This task is called by the Heroku scheduler add-on"
task :cleanup do
  puts DateTime.parse(Time.now.to_s) - 30
  Poster.all(:created_at.lte => (DateTime.parse(Time.now.to_s) - 30)).each do |poster|
    poster.destroy
  end
  # remove old fliers (before_destroy :destroy_cloudinary_image)
  puts "Destroyed all fliers older than 30 days"
end

namespace :clean do
  desc 'Clean users data'
  task :users do
    User.all.each do |user|
      attr_updated = false

      if user.auth_key.blank?
        user.auth_key = Digest::MD5.hexdigest Time.now.to_s
        attr_updated = true
      end

      if user.latitude.blank? || user.longitude.blank?
        address = []
        address << "#{user.street_address}" unless user.street_address.nil?
        address << ", #{user.city}"         unless user.city.nil?
        address << ", #{user.state}"        unless user.state.nil?
        address << "#{user.zip_code}"       unless user.zip_code.nil?

        address_str = address.join(' ').gsub(' ,',',').gsub(' ','%20').gsub('#','%23').gsub('&','%26')

        url = "https://maps.googleapis.com/maps/api/geocode/json?address=#{address_str}&sensor=false"
        geocode = JSON.parse RestClient.get(url)

        if geocode['status'] == 'OK'
          user.latitude  = geocode['results'][0]['geometry']['viewport']['northeast']['lat'].to_s
          user.longitude = geocode['results'][0]['geometry']['viewport']['northeast']['lng'].to_s

          attr_updated = true
        end
      end

      if attr_updated == true
        user.save
        puts 'Updated users'
      else
        puts 'No users to update'
      end
    end
  end
end

desc 'Import CSV from tmp directory'
task :import do
  CSV.foreach("tmp/#{Time.now.strftime('%Y%m%d')}.csv") do |row|
    user = User.new({ email: row[0], first_name: row[1], last_name: row[2], street_address: row[3], city: row[4], state: row[5], zip_code: row[6], source: 'simpleleads.com' })

    if user.save
      puts "Imported #{user.email}"
    else
      puts "Could not import #{user.email}: #{user.errors.full_messages}"
    end
  end
end

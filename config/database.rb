require 'rubygems'
require 'data_mapper'
require './models/poster'
require './models/layout'
require './models/user'
require './models/report'
require './models/photo'

DataMapper.setup(:default, ENV['DATABASE_URL'] || "postgres://localhost/missinghippo")

DataMapper.finalize
DataMapper.auto_upgrade!

DataMapper::Model.raise_on_save_failure = false
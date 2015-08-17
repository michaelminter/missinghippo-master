class Layout
  include DataMapper::Resource

  property :id,        Serial
  property :name,      String, :required => true
  property :file_name, String, :required => true

  #has n, :posters
end
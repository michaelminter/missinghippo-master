class Photo
  include DataMapper::Resource

  property :id,             Serial
  property :cloudinary_id,  String
  property :format,         String

  property :report_id,      Integer

  property :created_at,     DateTime

  # belongs_to :report
end
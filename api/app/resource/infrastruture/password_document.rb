require 'singleton'

module PasswordStorage
  module Resource::Infrastruture
    class PasswordDocument
      include Mongoid::Document
      include Core::Infrastruture::RevisableConcern
      
      field :uuid, type: String
      field :title, type: String
      field :username, type: String
      field :password, type: String
      field :active, type: Boolean, default: true
      field :informations, type: Array

      belongs_to :user, class_name: User::Infrastruture::UserDocument.name
      belongs_to :category, class_name: CategoryDocument.name


      index({user_id: 1}, {background: true})
      index({uuid: 1}, {background: true})
      index({category_id: 1}, {background: true})

      store_in collection: "passwords"      
    end
  end
end
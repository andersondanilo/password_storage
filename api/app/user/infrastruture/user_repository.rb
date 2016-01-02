require 'bcrypt'
require 'singleton'

module PasswordStorage
  module User
    module Infrastruture
      class UserRepository < PasswordStorage::Core::Infrastruture::MongoidRepository
        include Singleton

        def initialize
          super
          @document_class = UserDocument

          @converter.register(
            UserDocument => Domain::User,
            &method(:user_document_to_entity)
          )

          @converter.register(
            Domain::User => @document_class,
            &method(:entity_to_user_document)
          )
        end

        def find_by_email(email)
          document = UserDocument.find_by(email: email)
          data_to_entity(document) if document
        end

        def find(id)
          document = UserDocument.find(id)
          data_to_entity(document) if document
        end

        def entity_to_user_document(entity)
          if entity.id.nil?
            document = UserDocument.new
          else
            document = UserDocument.find(entity.id)
          end
          document.name = entity.name
          document.email = entity.email
          document.password = entity.password
          document.crypt_salt = entity.crypt_salt
          document
        end

        def user_document_to_entity(document)
          user = Domain::User.new
          user.id = document.id
          user.name = document.name
          user.email = document.email
          user.password_hash = document.password_hash
          user.crypt_salt = document.crypt_salt
          return user
        end
      end
    end
  end
end
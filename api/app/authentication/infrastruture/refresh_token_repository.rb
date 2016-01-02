require 'singleton'

module PasswordStorage
  module Authentication
    module Infrastruture
      class RefreshTokenRepository < Core::Infrastruture::MongoidRepository
        include Singleton

        def initialize 
          super
          @document_class = RefreshTokenDocument

          @converter.register(
            @document_class => Domain::RefreshToken,
            &method(:refresh_token_to_entity)
          )

          @converter.register(
            Domain::RefreshToken => @document_class,
            &method(:refresh_token_to_document)
          )
        end

        def find_by_token(token)
          document = @document_class.find_by(token: token)
          data_to_entity(document) if document
        end

        def refresh_token_to_entity(document)
          entity = Domain::RefreshToken.new
          entity.id = document.id
          entity.token = document.token
          entity.expires_at = document.expires_at
          entity.expires_in = document.expires_in
          entity.user_id = document.user.id.to_s if document.user
          entity
        end

        def refresh_token_to_document(entity)
          if entity.id.nil?
            document = @document_class.new
          else
            document = @document_class.find(entity.id)
          end
          document.token = entity.token
          document.expires_at = entity.expires_at
          document.expires_in = entity.expires_in
          document.user_id = entity.user_id
          document
        end
      end
    end
  end
end
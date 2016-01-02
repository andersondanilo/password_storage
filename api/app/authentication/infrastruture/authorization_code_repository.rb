require 'singleton'

module PasswordStorage
  module Authentication
    module Infrastruture
      class AuthorizationCodeRepository < Core::Infrastruture::MongoidRepository
        include Singleton

        def initialize 
          super
          @document_class = AuthorizationCodeDocument

          @converter.register(
            @document_class => Domain::AuthorizationCode,
            &method(:authorization_code_to_entity)
          )

          @converter.register(
            Domain::AuthorizationCode => @document_class,
            &method(:authorization_code_to_document)
          )
        end

        def find_by_code(code)
          document = @document_class.find_by(code: code)
          data_to_entity(document) if document
        end

        def authorization_code_to_entity(document)
          entity = Domain::AuthorizationCode.new
          entity.id = document.id
          entity.code = document.code
          return entity
        end

        def authorization_code_to_document(entity)
          if entity.id.nil?
            document = @document_class.new
          else
            document = @document_class.find(entity.id)
          end
          document.id = entity.id
          document.code = entity.code
          document
        end
      end
    end
  end
end
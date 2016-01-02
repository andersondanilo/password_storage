require 'singleton'

module PasswordStorage
  module Authentication
    module Infrastruture
      class ClientRepository < Core::Infrastruture::MongoidRepository
        include Singleton

        def initialize 
          super
          @document_class = ClientDocument

          @converter.register(
            @document_class => Domain::Client,
            &method(:client_to_entity)
          )

          @converter.register(
            Domain::Client => @document_class,
            &method(:client_to_document)
          )
        end

        def find_by_client_id(client_id)
          document = @document_class.find_by(client_id: client_id)
          data_to_entity(document) if document
        end

        def client_to_entity(document)
          entity = Domain::Client.new
          entity.id = document.id
          entity.client_id = document.client_id
          entity.client_secret = document.client_secret
          return entity
        end

        def client_to_document(entity)
          if entity.id.nil?
            document = @document_class.new
          else
            document = @document_class.find(entity.id)
          end
          document.id = entity.id
          document.client_id = entity.client_id
          document.client_secret = entity.client_secret
          document
        end
      end
    end
  end
end
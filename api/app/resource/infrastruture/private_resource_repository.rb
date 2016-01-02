require 'singleton'

module PasswordStorage
  module Resource
    module Infrastruture

      class PrivateResourceRepository < PasswordStorage::Core::Infrastruture::MongoidRepository

        def initialize(user_id)
          @user_id = user_id
          super()
        end

        def find_by_uuid(uuid)
          document = @document_class.where({
            user_id: @user_id,
            uuid: uuid,
            active: true
          }).first
          data_to_entity(document) if document
        end

        def delete_by_uuid(uuid)
          document = @document_class.where(user_id: @user_id, uuid: uuid).first
          document.active = false
          document.save
        end

        def find_all()
          documents = @document_class.where({
            user_id: @user_id,
            active: true
          }).all
          documents.map do |document|
            data_to_entity(document)
          end
        end

        def save(entity)
          entity.user_id = @user_id
          super(entity)
        end

      end

    end
  end
end
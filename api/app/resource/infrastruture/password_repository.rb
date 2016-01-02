module PasswordStorage
  module Resource
    module Infrastruture

      class PasswordRepository < PrivateResourceRepository

        def initialize(user_id)
          @document_class = PasswordDocument
          super(user_id)
        end

        def find_by_category(category_id)
          documents = @document_class.where({
            user_id: @user_id,
            category_id: category_id,
            active: true
          }).all
          documents.map do |document|
            data_to_entity(document)
          end
        end

      end

      # Convert document to entity
      converter.register PasswordDocument => Domain::Password do |document|
        entity = Domain::Password.new
        entity.id = document.id
        entity.rev = document._rev_id
        entity.uuid = document.uuid
        entity.title = document.title
        entity.username = document.username
        entity.password = document.password
        entity.user_id = document.user_id
        entity.category_uuid = document.category.uuid
        entity.informations = []

        if document.informations && document.informations.length > 0
          document.informations.each do |information|
            entity.informations.push({
              name: information[:name],
              value: information[:value]
            })
          end
        end

        entity
      end

      # Convert entity to document
      converter.register Domain::Password => PasswordDocument do |entity|
        if !entity.id.nil?
          document = PasswordDocument.find(entity.id)
          unless entity.rev.nil? || entity.rev.length == 0
            patch_service.go_to_revision(document, entity.rev)
          end
        else
          document = PasswordDocument.new
        end

        user_repository = User::Infrastruture::UserRepository.instance
        user = user_repository.find_by_id(entity.user_id)

        category_repository = Infrastruture::CategoryRepository.new(user.id)
        category = category_repository.find_by_uuid(entity.category_uuid)        

        document.uuid = entity.uuid
        document.title = entity.title
        document.username = entity.username
        document.password = entity.password
        document.user_id = entity.user_id
        document.category_id = category.id
        document.informations = []

        if entity.informations && entity.informations.length > 0
          entity.informations.each do |information|
            information = information.to_h.symbolize_keys
            document.informations.push({
              name: information[:name],
              value: information[:value]
            })
          end
        end

        document
      end

    end
  end
end
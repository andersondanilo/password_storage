module PasswordStorage
  module Resource
    module Infrastruture

      class CategoryRepository < PrivateResourceRepository

        def initialize(user_id)
          @document_class = CategoryDocument
          super(user_id)
        end

      end

      # Convert document to entity
      converter.register CategoryDocument => Domain::Category do |document|
        entity = Domain::Category.new
        entity.id = document.id
        entity.rev = document._rev_id
        entity.uuid = document.uuid
        entity.name = document.name
        entity.user_id = document.user_id
        entity
      end

      # Convert entity to document
      converter.register Domain::Category => CategoryDocument do |entity|
        if !entity.id.nil?
          document = CategoryDocument.find(entity.id)
          unless entity.rev.nil? || entity.rev.length == 0
            patch_service.go_to_revision(document, entity.rev)
          end
        else
          document = CategoryDocument.new
        end

        document.uuid = entity.uuid
        document.name = entity.name
        document.user_id = entity.user_id
        document
      end

    end
  end
end
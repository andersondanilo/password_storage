module PasswordStorage
  module Core
    module Infrastruture
      class MongoidRepository

        def initialize
          @converter = resolve :converter
        end

        def entity_to_data(entity)
          document_class = @converter.alternatives(entity.class).find do |to_class|
            to_class < Mongoid::Document
          end

          @converter.convert entity => document_class
        end

        def data_to_entity(data)
          entity_class = @converter.alternatives(data.class).first
          @converter.convert data => entity_class
        end

        def save(entity)
          document = entity_to_data(entity)

          if entity.respond_to?('id') && entity.id && entity.respond_to?('rev')
            revision = revision_factory.create_revision_from_changes document

            document = patch_service.patch_document(document.reload, revision.operations)
          end

          document.save

          new_entity = data_to_entity(document)

          entity.instance_variables.each do |variable|
            entity.instance_variable_set(variable, nil)
          end

          new_entity.instance_variables.each do |variable|
            entity.instance_variable_set(
              variable,
              new_entity.instance_variable_get(variable)
            )
          end

          entity
        end

        def find_by_id(id)
          document = @document_class.find(id)
          data_to_entity(document) if document
        end
      end
    end
  end
end
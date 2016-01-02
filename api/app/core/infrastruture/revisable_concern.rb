module PasswordStorage
  module Core
    module Infrastruture
      module RevisableConcern
        extend ActiveSupport::Concern

        included do
          embeds_many :_revisions, class_name: RevisionDocument.name, as: :revisable

          field :_rev_id, type: String
          attr_accessor :old_revisable_hash

          after_find do |document|
            @old_revisable_hash = document.to_revisable_hash
          end

          before_save do |document|
            if document.changes.length > 0
              revision = revision_factory.create_revision_from_changes document
              if revision.operations.length > 0
                document._revisions << revision if revision
              end
            end

            document._rev_id = document._revisions.last.id if document._revisions.last
          end

          after_save do |document|
            @old_revisable_hash = document.to_revisable_hash
          end
        end

        def to_revisable_hash
          document_hash = serializable_hash
          revisable_attributes_names = revisable_attributes
          document_hash.delete_if do |key,value| 
            not (revisable_attributes_names.include? key)
          end
          document_hash
        end

        def revisable_attributes
          results = []
          attribute_names.each do |attribute_name|
            unless attribute_name.starts_with?('_') || (attribute_name == 'id') || (attribute_name.include? '_id')
              results << attribute_name
            end
          end
          results
        end

        def from_revisable_hash(document_hash)
          revisable_attributes.each do |attribute_name|
            assign_attributes({
              "#{attribute_name}" => if document_hash.include? attribute_name then
                document_hash[attribute_name]
              else
                nil
              end
            })
          end
          @old_revisable_hash = to_revisable_hash
        end

        module ClassMethods
          
        end
      end
    end
  end
end
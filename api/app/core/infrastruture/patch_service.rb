require 'singleton'

module PasswordStorage
  module Core
    module Infrastruture
      class PatchService
        include Singleton

        def initialize
          @revision_factory = resolve :revision_factory
        end


        def patch_document(document, operations, patch_date=nil)
          if document._revisions.length == 0
            # Do the first revision
            document._revisions << @revision_factory.create_revision_from_hashs(
              {},
              document.to_revisable_hash
            )
          end

          revision = @revision_factory.create_revision_from_operations(operations, patch_date)        

          document._revisions << revision

          go_to_revision document, revision.id
        end

        def go_to_revision(document, revision_id)
          document_hash = {} # start blank
          revisions_sorted = document._revisions.sort_by { |rev| rev.created_at }
          revisions_sorted.each do |revision|
            begin
              JSON::Patch.new(document_hash, revision.operations).call
            rescue
              revision.operations.each do |operation|
                begin
                  JSON::Patch.new(document_hash, [operation]).call
                rescue Exception => e
                  logger = API.logger
                  logger.error "Fail: #{operation.to_s} with #{e.to_s} on #{document.id}"
                end
              end
            end
          end
          document.from_revisable_hash(document_hash)
          document
        end
      end
    end
  end
end
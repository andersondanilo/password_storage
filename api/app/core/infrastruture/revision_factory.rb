require 'singleton'

module PasswordStorage
  module Core
    module Infrastruture
      class RevisionFactory
        include Singleton

        def create_revision_from_hashs(old_document_hash, new_document_hash)
          revision = RevisionDocument.new
          revision.type = 'patch'
          operations = JsonDiff.generate(old_document_hash, new_document_hash)
          revision.operations = parse_operations(operations)
          revision
        end

        def create_revision_from_operations(operations, patch_date)
          revision = RevisionDocument.new
          revision.type = 'patch'
          revision.operations = parse_operations(operations)
          unless patch_date == nil
            revision.created_at = patch_date
          end
          revision
        end

        def create_revision_from_changes(document)
          old_document_hash = document.old_revisable_hash || {}
          new_document_hash = document.to_revisable_hash
          revision = create_revision_from_hashs(old_document_hash, new_document_hash)
          revision
        end

        def parse_operations(operations)
          operation_order = [:test, :remove, :add, :replace, :move, :copy]
          JSON.parse(operations.to_json).sort do |op1, op2|
            op1_order = operation_order.index(op1["op"].to_sym)
            op2_order = operation_order.index(op2["op"].to_sym)
            op1_order <=> op2_order
          end
        end
      end
    end
  end
end

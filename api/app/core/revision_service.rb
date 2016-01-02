require 'jsondiff'
require 'json/patch'
require 'singleton'

module PasswordStorage
  module Core
    class RevisionService
      include Singleton

      def initialize
        @revision_repository = resolve :revision_repository
        @patch_service = resolve :patch_service
      end
    end
  end
end
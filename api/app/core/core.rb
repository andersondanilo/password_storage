require 'jsondiff'
require 'json/patch'

module PasswordStorage
  module Core
    autoload_relative File.dirname(__FILE__), 'module_base'
    extend Core::ModuleBase

    module Infrastruture
        autoload_relative File.dirname(__FILE__), 'infrastruture/mongoid_repository'
        autoload_relative File.dirname(__FILE__), 'infrastruture/converter'

        autoload_relative File.dirname(__FILE__), 'infrastruture/patch_service'
        autoload_relative File.dirname(__FILE__), 'infrastruture/revisable_concern'
        autoload_relative File.dirname(__FILE__), 'infrastruture/revision_factory'
        autoload_relative File.dirname(__FILE__), 'infrastruture/revision_document'
    end

    module Presenter
        module JsonApi
            autoload_relative File.dirname(__FILE__), 'presenter/json_api/validator_presenter'
            autoload_relative File.dirname(__FILE__), 'presenter/json_api/resource_presenter'
            autoload_relative File.dirname(__FILE__), 'presenter/json_api/error_presenter'
        end
    end    

    autoload_relative File.dirname(__FILE__), 'revision_service'

    register(:converter) { Infrastruture::Converter.instance }

    register(:patch_service) { Infrastruture::PatchService.instance }
    register(:revision_repository) { Infrastruture::RevisionRepository.instance }
    register(:revision_factory) { Infrastruture::RevisionFactory.instance }
    register(:revision_service) { RevisionService.instance }
  end
end
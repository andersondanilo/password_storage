require 'dry-container'

module PasswordStorage
  module Core::ModuleBase

    def path
      if @path == nil
        path = self.name.split('::')
        path.shift
        path = path.map{|s| s.gsub(/([a-z])([A-Z])/,'\1_\2')}.join('/')
        path.downcase!
        @path = File.dirname(__FILE__) + '/../' + path
      end
      @path
    end
  end
end
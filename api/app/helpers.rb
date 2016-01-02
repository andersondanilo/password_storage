require 'dry-container'
container = Dry::Container.new

define_method :define_method_global, &method(:define_method)

define_method :resolve, &container.method(:resolve)
define_method :register do |*args, &block| 
  if args[0] =~ /^[a-z0-9_]+$/
    define_method_global args[0].to_sym do
      container.resolve(args[0].to_sym)
    end
  end
  container.register(*args, &block)
end

base_path = File.dirname(__FILE__)
cached_module_base_path = Hash.new

define_method :autoload_relative do |module_base_path, file|
  class_name = file.split("/").last.split('_').map{|word| word.capitalize}.join
  class_name = class_name.sub('Oauth', 'OAuth')

  self.autoload class_name.to_sym, "#{module_base_path}/#{file}"
end
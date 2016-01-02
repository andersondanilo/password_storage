PasswordStorage::modules.each do |mod|
  filename = "#{mod.path}/test/factories"

  require_relative filename if File.exists? "#{filename}.rb"
end
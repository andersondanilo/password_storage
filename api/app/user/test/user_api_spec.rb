require 'base64'
describe PasswordStorage::User::UserApi do
  include Rack::Test::Methods

  def app
    PasswordStorage::RackApp.instance
  end

  describe "POST /api/v1/users" do
    context "Valid register" do
      let :response do
        header "Authorization", "Basic #{Base64.encode64(client[:id]+":"+client[:secret])}"

        post "/api/v1/users", {
          data: {
            type: 'users',
            attributes: {
              name: 'My Name',
              email: 'teste@testerson.com',
              password: 'Password@123'
            }
          }
        }
      end

      it 'Return success' do
        expect(response.status).to eq(201)
      end
    end

    context "Bad password does not work" do
      let :response do
        header "Authorization", "Basic #{Base64.encode64(client[:id]+":"+client[:secret])}"
        
        post "/api/v1/users", {
          data: {
            type: 'users',
            attributes: {
              name: 'My Name',
              email: 'teste@testerson.com',
              password: '12345678'
            }
          }
        }
      end

      it 'Return error' do
        expect(response.status).to eq(400)
      end
    end
  end
end
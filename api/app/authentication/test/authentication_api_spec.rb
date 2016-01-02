require 'base64'

describe PasswordStorage::Authentication::AuthenticationApi do
  include Rack::Test::Methods

  def app
    PasswordStorage::RackApp.instance
  end

  describe "POST /api/v1/authentication/token" do
    let(:request_params) do
      {
        grant_type: 'password',
        client_id: client[:id],
        client_secret: client[:secret]
      }
    end

    context "Invalid login" do
      let(:response) do
        request_params[:username] = 'test1'
        request_params[:password] = 'test2'
        post "/api/v1/authentication/token", request_params
      end

      it 'fail with invalid password' do
        expect(response.status).to eq(400)
      end
    end


    context "Valid login" do
      let(:user) { create :user }

      let(:response) do
        request_params[:username] = user.email
        request_params[:password] = user.password
        post "/api/v1/authentication/token", request_params
      end

      let(:response_body) { JSON.parse(response.body) }

      it 'Success' do
        expect(response.status).to eq(200)
      end

      it 'Return AccessToken' do
        expect(response_body["access_token"]).to_not be_nil
      end

    end
  end
end
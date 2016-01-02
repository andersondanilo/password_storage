
describe PasswordStorage::Resource::CategoriesApi do
  include Rack::Test::Methods

  def app
    PasswordStorage::RackApp.instance
  end

  let (:user) { create(:user) }

  let (:access_token) { create(:access_token, user: user).token }

  describe "POST /api/v1/categories" do
    context "When insert category with success" do
      let :response do
        header "Authorization", "Bearer #{access_token}"
        post "/api/v1/categories", {
          data: {
            type: 'categories',
            attributes: {
              uuid: '1-1-2-1',
              rev: nil,
              name: 'My Category'
            }
          }
        }
      end

      it 'Return success' do
        expect(response.status).to eq(201)
      end

      it "Return an new revision" do
        json_body = JSON.parse response.body
        expect(json_body["data"]["attributes"]["rev"]).to_not be_nil
      end

    end
  end

  describe "PATCH /api/v1/categories/:uuid" do
    context "When update category with success" do
      let(:category_document) { create(:category, user_id: user.id.to_s) }

      let :response do
        header "Authorization", "Bearer #{access_token}"
        patch "/api/v1/categories/#{category_document.uuid}", {
          data: {
            type: 'categories',
            attributes: {
              uuid: category_document.uuid,
              rev: category_document._rev_id,
              name: "Yes, Other Name"
            }
          }
        }
      end

      it 'Return success' do
        expect(response.status).to eq(200)
      end

      it "Update name of category" do
        response

        expect(category_document._revisions.length).to eq(1)

        new_category_document = category_document.reload

        expect(new_category_document.name).to eq("Yes, Other Name")

        expect(new_category_document._revisions.length).to eq(2)
      end

      it "Return an new revision" do
        response

        expect(category_document._rev_id).to_not be_nil

        json_body = JSON.parse response.body
        expect(json_body["data"]["attributes"]["rev"]).to_not eq(category_document._rev_id)
      end
    end
  end


  describe "DELETE /api/v1/categories/:uuid" do
    context "When delete category" do
      let(:category_document) { create(:category, user_id: user.id.to_s) }

      let :response do
        header "Authorization", "Bearer #{access_token}"
        delete "/api/v1/categories/#{category_document.uuid}"
      end

      it 'Return success' do
        expect(response.status).to eq(200)
      end

      it "And change state of document" do
        response

        expect(category_document.reload.active).to eq(false)
      end
    end
  end

  describe "GET /api/v1/categories" do
    context "When list categories" do
      let(:category1) { create(:category, user_id: user.id.to_s, name: 'category 1') }
      let(:category2) { create(:category, user_id: user.id.to_s, name: 'category 2') }

      let :response do
        category1
        category2
        header "Authorization", "Bearer #{access_token}"
        get "/api/v1/categories"
      end

      it 'Return success' do
        expect(response.status).to eq(200)
      end

      it "Return my categories" do
        response

        json_body = JSON.parse response.body

        expect(json_body["data"].length).to eq(2)
        expect(json_body["data"][0]["attributes"]["name"]).to eq('category 1')
        expect(json_body["data"][1]["attributes"]["name"]).to eq('category 2')
      end
    end

    context "When empty" do
      let :response do
        header "Authorization", "Bearer #{access_token}"
        get "/api/v1/categories"
      end

      it 'Return success' do
        expect(response.status).to eq(200)
      end

      it "Return key 'data' as empty array" do
        response

        json_body = JSON.parse response.body

        expect(json_body["data"].length).to eq(0)
      end
    end
  end
end
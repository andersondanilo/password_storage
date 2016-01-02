describe PasswordStorage::Core::Infrastruture::PatchService do

  class MyDocument
    include Mongoid::Document
    include PasswordStorage::Core::Infrastruture::RevisableConcern

    field :name, type: String
    field :email, type: String
  end

  describe '#patch' do
    let(:service) { PasswordStorage::resolve(:patch_service) }
    let(:document) {
      doc = MyDocument.new
      doc.email = 'teste'
      doc
    }

    it 'apply revision when empty' do
      expect(document._revisions).to eq([])
      original_patch = [
        {"op"=>"add", "path"=>"/email", "value"=>"teste"},
        {"op"=>"add", "path"=>"/name", "value"=>nil}
      ]
      json_patch = [{"op"=>"add", "path"=>"/name", "value"=>"Yes We Can"}]
      service.patch_document(document, json_patch)

      expect(document._revisions.length).to eq(2)

      created_at = Time.now.to_s[0,19]

      expect(document._revisions.length).to eq(2)

      expect(document._revisions[0].id).to_not be_nil
      expect(document._revisions[0].type).to eq('patch')
      expect(document._revisions[0].operations).to eq(original_patch)
      #expect(document._revisions[0].created_at.to_s[0,19]).to eq(created_at)

      expect(document._revisions[1].id).to_not be_nil
      expect(document._revisions[1].type).to eq('patch')
      expect(document._revisions[1].operations).to eq(json_patch)
      #expect(document._revisions[1].created_at.to_s[0,19]).to eq(created_at)
    end

    it 'does not conflit with save callback' do
      document.save
      saved_document = MyDocument.find(document.id)

      original_patch = [
        {"op"=>"add", "path"=>"/email", "value"=>"teste"},
        {"op"=>"add", "path"=>"/name", "value"=>nil}
      ]

      json_patch = [{"op"=>"add", "path"=>"/name", "value"=>"Yes We Can"}]

      service.patch_document(saved_document, json_patch)

      created_at = Time.now.to_s[0,19]

      expect(saved_document._revisions.length).to eq(2)
      
      expect(saved_document._revisions[0].id).to_not be_nil
      expect(saved_document._revisions[0].type).to eq('patch')
      expect(saved_document._revisions[0].operations).to eq(original_patch)
      #expect(saved_document._revisions[0].created_at.to_s[0,19]).to eq(created_at)

      expect(saved_document._revisions[1].id).to_not be_nil
      expect(saved_document._revisions[1].type).to eq('patch')
      expect(saved_document._revisions[1].operations).to eq(json_patch)
      #expect(saved_document._revisions[1].created_at.to_s[0,19]).to eq(created_at)
    end

    it 'understand retroactive changes' do
      patch1 = [
        {"op"=>"replace", "path"=>"/email", "value"=>"email1"},
        {"op"=>"remove", "path"=>"/nome"}
      ]
      patch2 = [
        {"op"=>"replace", "path"=>"/email", "value"=>"email2"},
        {"op"=>"replace", "path"=>"/nome", "value"=>"my name"}
      ]

      service.patch_document(document, patch1, 5.minutes.since)
      service.patch_document(document, patch2, 10.minutes.since)

      expect(document.email).to eq('email2')

      service.patch_document(document, patch2, 5.minutes.since)
      service.patch_document(document, patch1, 10.minutes.since)

      expect(document.email).to eq('email1')
    end

    it 'should auto patch saved documents with changes' do
      document.save
      document.email = '5'
      document.save

      original_patch = [
        {"op"=>"add", "path"=>"/email", "value"=>"teste"},
        {"op"=>"add", "path"=>"/name", "value"=>nil}
      ]

      json_patch = [{"op"=>"replace", "path"=>"/email", "value"=>"5"}]

      expect(document._revisions.length).to eq(2)
      
      expect(document._revisions[0].id).to_not be_nil
      expect(document._revisions[0].type).to eq('patch')
      expect(document._revisions[0].operations).to eq(original_patch)

      expect(document._revisions[1].id).to_not be_nil
      expect(document._revisions[1].type).to eq('patch')
      expect(document._revisions[1].operations).to eq(json_patch)
    end
  end
end
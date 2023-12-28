const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;



// MongoDB'ye Bağlan
mongoose.connect('mongodb://127.0.0.1/saglikliyasam', { useNewUrlParser: true, useUnifiedTopology: true });


// MongoDB Şema Tanımı
const vkiSchema = new mongoose.Schema({
    isim: String,
    boyUzunlugu: String,
    vucutAgirligi: String,
    yas: String,
    cinsiyet: String,
    vki: String
  });
  
  // MongoDB Modeli Oluştur
  const VkiModel = mongoose.model('VKI', vkiSchema);
  
  // Middleware
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static('public'));
  
  // Route Tanımı
  app.post('/hesapla', async (req, res) => {
    const { isim, boyUzunlugu, vucutAgirligi, yas, cinsiyet } = req.body;
  
    // Veri tipi kontrolü yapılmadan doğrudan MongoDB'ye ekleniyor
    try {
      const yeniVKI = new VkiModel({
        isim,
        boyUzunlugu,
        vucutAgirligi,
        yas,
        cinsiyet,
        vki: "Hesaplanmadı" // VKI'yi burada "Hesaplanmadı" olarak ayarlıyoruz
      });
  
      await yeniVKI.save();
  
      res.redirect('/index.html');
    } catch (error) {
      console.error(error);
      res.status(500).send("Veri eklenirken bir hata oluştu.");
    }
  });
  
  // server.js
// ...

// Route Tanımı: Tüm verileri çekme
app.get('/tumVeriler', async (req, res) => {
    try {
      const tumVeriler = await VkiModel.find({}, { __v: 0 }); // _id ve __v hariç tüm alanları alır
      res.json(tumVeriler);
    } catch (error) {
      console.error(error);
      res.status(500).send("Tüm veriler çekilirken bir hata oluştu.");
    }
  });

  app.delete('/silVeri/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      const silinenVeri = await VkiModel.findByIdAndDelete(id);
      if (silinenVeri) {
        res.json({ success: true, message: 'Veri başarıyla silindi.' });
      } else {
        res.json({ success: false, message: 'Veri bulunamadı veya silinirken bir hata oluştu.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Veri silinirken bir hata oluştu.");
    }
  });

// Route Tanımı: Veriyi güncelleme formunu gösterme
app.get('/duzenleForm/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const duzenleVeri = await VkiModel.findById(id);
        res.render('duzenleForm', { duzenleVeri });
    } catch (error) {
        console.error(error);
        res.status(500).send("Veri düzenleme formu gösterilirken bir hata oluştu.");
    }
});

// Route Tanımı: Veriyi güncelleme
app.put('/duzenleVeri/:id', async (req, res) => {
    const id = req.params.id;
    const guncellenecekVeri = req.body;

    try {
        const guncellenenVeri = await VkiModel.findByIdAndUpdate(id, guncellenecekVeri, { new: true });
        if (guncellenenVeri) {
            res.json({ success: true, message: 'Veri başarıyla güncellendi.' });
        } else {
            res.json({ success: false, message: 'Veri bulunamadı veya güncellenirken bir hata oluştu.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Veri güncellenirken bir hata oluştu.");
    }
});

  
    // Server'ı Başlat
    app.listen(port, () => {
        console.log(`Uygulama ${port} portunda çalışıyor.`);
      });
    
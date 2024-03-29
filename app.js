const express = require("express");
const multer = require("multer");
const ejs = require("ejs");
const fs = require("fs").promises;
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const toGeoJSON = require("togeojson");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { DOMParser } = require("xmldom");
const JSZip = require("jszip");
require('dotenv').config();
const session = require('express-session');
const cookieParser = require('cookie-parser');


// Настройка EJS шаблонизатора
app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use(session({
    secret: 'your_secret_key', // Замените на ваш секретный ключ
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Для HTTPS установите secure: true
}));

// Использование учетных данных из файла .env
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;


// Маршрут для админ-панели
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      req.session.authenticated = true;
      res.redirect('/admin-panel');
  } else {
      res.send('Доступ запрещен');
  }
});

// Middleware для проверки аутентификации
function isAuthenticated(req, res, next) {
  // if (req.session.authenticated) {
  //     next();
  // } else {
  //     res.send('Необходима авторизация');
  // }
  next()
}

app.get('/login',  (req, res) => {
  res.render('login');
});
// Защищенный маршрут
app.get('/admin-panel', isAuthenticated, (req, res) => {
  res.render('admin-panel');
});

// Еще один защищенный маршрут
app.get('/map-editor', isAuthenticated, (req, res) => {
  res.render('map-editor');
});

// Добавление меток
app.post("/map-editor", async (req, res) => {
  const geojsonFilePath = "marks.json";
  console.log(req.body);
  async function addDataToGeoJSONFile(req) {
    try {
      // Попытка чтения GeoJSON файла
      let geojsonData;
      try {
        const fileContent = await fs.readFile(geojsonFilePath, "utf8");
        geojsonData = JSON.parse(fileContent);
      } catch (error) {
        // Если файл не существует или не содержит данных JSON, создайте новый GeoJSON
        geojsonData = {
          type: "FeatureCollection",
          features: [],
        };
      }
      let newMark = req.body;
      newMark.properties.id = uuidv4();
      // Добавление новой фичи в массив фич
      geojsonData.features.push(newMark);

      // Преобразование обновленных данных в JSON формат
      const updatedData = JSON.stringify(geojsonData, null, 2);

      // Запись обновленных данных обратно в файл
      await fs.writeFile(geojsonFilePath, updatedData, "utf8");
      console.log("Объект успешно добавлен в GeoJSON файл.");
    } catch (error) {
      console.error("Ошибка при добавлении в GeoJSON файл:", error);
    }
  }
  addDataToGeoJSONFile(req);
});

// Удаление меток
app.post("/deleteMark", async (req, res) => {
  const { id } = req.body;

  try {
    // Асинхронное чтение geojson данных из файла
    let data = JSON.parse(await fs.readFile("marks.json", "utf8"));
    // Фильтрация объектов, удаляя те, что имеют заданный id
    const initialLength = data.features.length;
    data.features = data.features.filter(
      (feature) => feature.properties.id !== id
    );
    // Проверка, изменился ли массив
    if (data.features.length !== initialLength) {
      // Асинхронное сохранение обновленных данных обратно в файл
      await fs.writeFile("marks.json", JSON.stringify(data, null, 4));
      res.status(200).send({ message: "Objects deleted successfully." });
    } else {
      res.status(404).send({ message: "Object not found." });
    }
  } catch (error) {
    // Отправка ошибки, если что-то пошло не так
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

// Редактирование меток
app.post("/editMark", async (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const description = req.body.description;
  const titlePt = req.body.titlePt;
  const descriptionPt = req.body.descriptionPt;
  const link = req.body.link;

  try {
    // Чтение содержимого GeoJSON файла
    const geojsonContent = await fs.readFile("marks.json", "utf8");
    const geojsonData = JSON.parse(geojsonContent);

    // Поиск объекта по ID
    const objectToEdit = geojsonData.features.find(
      (feature) => feature.properties.id === id
    );

    if (objectToEdit) {
      // Обновление title и description объекта
      objectToEdit.properties.title = title;
      objectToEdit.properties.description = description;
      objectToEdit.properties.titlePt = titlePt;
      objectToEdit.properties.descriptionPt = descriptionPt;
      objectToEdit.properties.link = link;

      // Сохранение обновленного содержимого обратно в файл
      await fs.writeFile("marks.json", JSON.stringify(geojsonData, null, 4));

      res.status(200).send({ message: "GeoJSON object updated successfully." });
    } else {
      res
        .status(404)
        .send({ message: "GeoJSON object with given ID not found." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Получение меток
app.get("/getMarks", (req, res) => {
  const geojsonFilePath = "marks.geojson";
  async function addDataToGeoJSONFile(req) {
    try {
      // Попытка чтения GeoJSON файла
      let geojsonData;
      try {
        const fileContent = await fs.readFile(geojsonFilePath, "utf8");
        geojsonData = JSON.parse(fileContent);
      } catch (error) {}

      // Добавление новой фичи в массив фич
      res.json(geojsonData);
    } catch (error) {
      console.error("Ошибка при добавлении в GeoJSON файл:", error);
    }
  }
  addDataToGeoJSONFile(req);
});

// Загрузка KML файла
app.post("/uploadKMZ", upload.single("kmlFile"), async (req, res) => {
  const zip = new JSZip();
  const zipContents = await zip.loadAsync(req.file.buffer);
  const kmlFile = zipContents.file(/\.kml$/i)[0];
  const kmlText = await kmlFile.async("string");

  // Создание DOM из KML текста
  const dom = new DOMParser().parseFromString(kmlText);
  const kml = dom.documentElement;

  // Преобразование KML в GeoJSON
  const geoJSON = toGeoJSON.kml(kml);
  const commonUUID = uuidv4();

  // Добавление уникального ID к каждому feature
  geoJSON.features.forEach((feature) => {
    feature.properties.id = uuidv4();
    feature.properties.title = req.body["kmz-title"];
    feature.properties.description = req.body["kmz-description"];
    feature.properties.titlePt = req.body["kmz-title-pt"];
    feature.properties.descriptionPt = req.body["kmz-description-pt"];
    feature.properties.link = req.body["kmz-link"];

    if (feature.geometry && feature.geometry.type === "LineString") {
      // Преобразование LineString в Polygon
      feature.geometry.type = "Polygon";
      // Оборачиваем координаты LineString в дополнительный массив для Polygon
      feature.geometry.coordinates = [feature.geometry.coordinates];
      feature.properties.id = commonUUID;
    }
  });

  try {
    // Попытка чтения файла mark.geojson
    let existingData;
    try {
      const existingGeoJSON = await fs.readFile("marks.json", "utf8");
      existingData = JSON.parse(existingGeoJSON);
    } catch (error) {
      // Если файл не существует или пустой, создаем новый объект GeoJSON
      existingData = { type: "FeatureCollection", features: [] };
    }

    // Добавление новых меток, избегая дубликатов
    const newFeatures = geoJSON.features.filter(
      (newFeature) =>
        !existingData.features.some(
          (existingFeature) =>
            JSON.stringify(existingFeature.geometry.coordinates) ===
            JSON.stringify(newFeature.geometry.coordinates)
        )
    );

    existingData.features = existingData.features.concat(newFeatures);

    // Сохранение обновленного GeoJSON обратно в mark.geojson
    await fs.writeFile("marks.json", JSON.stringify(existingData, null, 2));

    res.send("Метки из KML файла успешно добавлены");
  } catch (error) {
    res.status(500).send("Ошибка при обработке файла: " + error.message);
  }
});

app.get("/landing/get", async (req, res) => {
  try {
    const jsonData = await fs.readFile("page-elements.json", "utf8");
    const data = JSON.parse(jsonData);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Не удалось загрузить данные" });
  }
});

app.delete("/delete/:id", async (req, res) => {

  try {
    const jsonData = await fs.readFile("page-elements.json", "utf8");
    let data = JSON.parse(jsonData);
    const id = req.params.id;
    let found = false;

    for (key in data) {
      const index = data[key].findIndex((obj) => obj.id === id);
      console.log(index)
      if (index > -1) {
        data[key].splice(index, 1);
        found = true;
        
      }
    }

    await fs.writeFile("page-elements.json", JSON.stringify(data, null, 2));
    if (!found) {
      res.status(404).send("Объект не найден.");
    }
    res.send(`Объект с ID ${id} удален.`);
  } catch (err) {
    res.status(500).send("Ошибка сервера: " + err.message);
  }
});

app.post("/landing/edit", async (req, res) => {
  try {
    const jsonData = await fs.readFile("page-elements.json", "utf8");
    let data = JSON.parse(jsonData);
    let found = false;

    for (key in data) {
      const index = data[key].findIndex((obj) => obj.id === req.body.id);
      if (index !== -1) {
        data[key][index] = { ...data[key][index], ...req.body };
        found = true;
        // Запись обновленных данных обратно в JSON-файл
        await fs.writeFile(
          "page-elements.json",
          JSON.stringify(data, null, 2),
          "utf8"
        );
      }
    }

    if (!found) {
      return res.status(404).send(`Элемент с ID ${req.body.id} не найден`);
    }

    res.status(200).send(`Элемент с ID ${req.body.id} изменен`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Ошибка на сервере");
  }
});

app.post("/landing/add", async (req, res) => {
  try {
    console.log(req.body);

    // Чтение данных из файла
    const jsonData = await fs.readFile("page-elements.json", "utf8");
    const data = JSON.parse(jsonData);
   
    // Создание нового элемента
    const newObj = req.body;
    newObj.id = uuidv4();

    // Обработка случаев "patents" и "publications"
    if (newObj.type === "patents" || newObj.type === "publications") {
      const listItems = newObj.description.split("\n");
      const listItemsPt = newObj.descriptionPt.split("\n");

      if (listItems.length == listItemsPt.length){
        const newItemList = listItems.map((item,index) => ({
          description: item,
          descriptionPt: listItemsPt[index],
          id: uuidv4(),
        }));
        data[newObj.type].push(...newItemList);
      }
    } else {
      data[newObj.type].push(newObj);
    }

    await fs.writeFile(
      "page-elements.json",
      JSON.stringify(data, null, 2),
      "utf8"
    );

    res.status(200).send("Элемент успешно добавлен.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при добавлении элемента.");
  }
});


app.post("/landing/drag", async (req, res) => {
  try {
    const jsonData = await fs.readFile("page-elements.json", "utf8");
    let data = JSON.parse(jsonData);
    let startIndex = req.body.start
    let indexToMoveTo  = req.body.end // Индекс, на который нужно переместить элемент
    console.log(req.body)
    const publications = data.publications;
    const elementToMove = data.publications[startIndex]; // Элемент, который вы хотите переместить
   
    data.publications.splice(data.publications.indexOf(elementToMove), 1); // Удаляем элемент из текущей позиции
    data.publications.splice(indexToMoveTo, 0, elementToMove);

    await fs.writeFile(
      "page-elements.json",
      JSON.stringify(data, null, 2),
      "utf8"
    );
   
    res.status(200).send(`Элемент с ID ${req.body.id} изменен`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Ошибка на сервере");
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});

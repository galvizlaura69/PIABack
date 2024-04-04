const express = require('express');
const axios = require('axios');

class CountryAPI {
  constructor() {
    this.app = express();
    this.port = 3010;
    this.baseUrl = 'https://restcountries.com/v3.1/';
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());
    this.app.get('/:country', this.getCountryData.bind(this));
    this.app.post('/', this.getCountryData.bind(this));
  }

  async getCountryData(req, res) {
    const { country } = req.params || req.body;
    const cleanCountry = country.toLowerCase();
    let mainDataCountry = `No hay datos para ${country}`;
    try {
      const { data } = await axios.get(`${this.baseUrl}name/${cleanCountry}`);
      const countryData = data[0];
      if (countryData) {
        mainDataCountry = {
          busqueda: country,
          nombre: countryData.name?.common,
          nombreOficial: countryData.name?.official,
          moneda: Object.values(countryData.currencies)[0]?.name,
          capital: countryData.capital[0],
          poblacion: countryData.population,
          idioma: Object.values(countryData.languages).toString(),
        };
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
    res.json(mainDataCountry);
  }

  startServer() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port http://localhost:${this.port}`);
    });
  }
}

const countryAPI = new CountryAPI();
countryAPI.startServer()
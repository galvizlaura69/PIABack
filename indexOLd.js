const express = require('express');
const axios = require('axios');

const app = express();
const port = 3010;
const baseUrl = 'https://restcountries.com/v3.1/';

app.use(express.json());


app.get('/:country', async (req, res) => {
  const { country } = req.params;
  const cleanCountry = country.toLowerCase();
  let mainDataCountry = `No hay datos para ${country}`;
  try {
    const { data } = await axios.get(`${baseUrl}name/${cleanCountry}`);
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
});

app.post('/', async (req, res) => {
  const { country } = req.body;
  const cleanCountry = country.toLowerCase();
  let mainDataCountry = `No hay datos para ${country}`;
  try {
    const { data } = await axios.get(`${baseUrl}name/${cleanCountry}`);
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
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

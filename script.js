const refs = {
	form: document.querySelector(".js-search"),
	formContainer: document.querySelector(".js-form-container"),
	addfield: document.querySelector(".js-add"),
	list: document.querySelector(".js-list"),
}

refs.addfield.addEventListener("click", addField);
refs.form.addEventListener("submit", handleSearch);

function addField() {
	refs.formContainer.insertAdjacentHTML("beforeend",
		`<input type="text" name="country">`);
}

async function handleSearch(event) {
	event.preventDefault();

	const formData = new FormData(event.currentTarget);
	const countries = formData
		.getAll("country")
		.map((country) => country.trim())
		.filter((country) => country);
	try {
		const capitals = await serviceCountry(countries);
		const weather = await serviceWeather(capitals);
		refs.list.innerHTML = createMarkup(weather);
	} catch (err) {
		console.log(err);
	}
	finally {
		event.target.reset();
		refs.formContainer.innerHTML = '<input type="text" name="country" />';
	}
	// console.log(countries)
}

function createMarkup(arr) {
	return arr.map(({
		temp_c,
		icon,
		text,
		name,
		country,
	}) => `<li>
<img src="${icon}" alt="${text}">
<h2>${country}</h2>
<h2>${name}</h2>
<p>${text}</p>
<p>${temp_c}</p>
	</li>`)
		.join("");
}

async function serviceCountry(countries) {
	const resp = countries.map(async (country) => {
		const { data } = await axios(`https://restcountries.com/v3.1/name/${country}`);

		return data[0].capital[0];
	});

	const data = await Promise.allSettled(resp);

	return data
		.filter(({ status }) => status === "fulfilled")
		.map(({ value }) => value);
}

// serviceCountry(countries).then(console.log);


async function serviceWeather(capitals) {
	const BASE_URL = "http://api.weatherapi.com/v1";
	const API_KEY = "66f9e81543404d02beb160521230808";
	const END_POINT = "/current.json";

	const resp = capitals.map(async (country) => {
		const { data } = await axios(
			`${BASE_URL}${END_POINT}?key=${API_KEY}&q=${country}`
		);
		return data;
	});

	const data = await Promise.allSettled(resp);

	return data
		.filter(({ status }) => status === "fulfilled")
		.map(({ value: { current, location } }) => {
			const {
				temp_c,
				condition: { icon, text },
			} = current;
			const { name, country } = location;
			return {
				temp_c,
				icon,
				text,
				name,
				country,
			};
		});
}

// const countries = ["Ukraine", "Poland", "Spain", "Canada"];
// const capitals = ["London", "Warsaw", "Madrid", "Ottawa"];




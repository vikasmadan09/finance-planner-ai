import pycountry
from babel.numbers import get_currency_symbol, get_territory_currencies


def get_currency_symbol_from_location(location):
    # Try to match the country name (case-insensitive)
    country = pycountry.countries.get(name=location)
    if not country:
        # Try fuzzy search (in case of slight mismatches like "United States")
        matches = pycountry.countries.search_fuzzy(location)
        if matches:
            country = matches[0]
        else:
            return None

    # Use alpha_2 code (e.g., 'IE' for Ireland)
    country_code = country.alpha_2
    currency_list = get_territory_currencies(country_code)

    if not currency_list:
        return None

    currency_code = currency_list[0]  # Usually there's only one
    currency_symbol = get_currency_symbol(currency_code)

    return currency_symbol

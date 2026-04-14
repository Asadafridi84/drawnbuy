# Step 1: Update COUNTRIES in data/index.js to have 17 countries
c = open('src/data/index.js', encoding='utf-8').read()

old_countries = """export const COUNTRIES = [
  {code:'SE', flag:'🇸🇪', name:'Sweden',      currency:'SEK'},
  {code:'NO', flag:'🇳🇴', name:'Norway',      currency:'NOK'},
  {code:'DK', flag:'🇩🇰', name:'Denmark',     currency:'DKK'},
  {code:'FI', flag:'🇫🇮', name:'Finland',     currency:'EUR'},
  {code:'DE', flag:'🇩🇪', name:'Germany',     currency:'EUR'},
  {code:'GB', flag:'🇬🇧', name:'UK',          currency:'GBP'},
  {code:'US', flag:'🇺🇸', name:'USA',         currency:'USD'},
  {code:'FR', flag:'🇫🇷', name:'France',"""

# Find the full COUNTRIES array and replace it
idx = c.find('export const COUNTRIES')
end = c.find('];', idx) + 2
new_countries = """export const COUNTRIES = [
  {code:'SE', flag:'🇸🇪', name:'Sweden',        currency:'SEK'},
  {code:'NO', flag:'🇳🇴', name:'Norway',        currency:'NOK'},
  {code:'DK', flag:'🇩🇰', name:'Denmark',       currency:'DKK'},
  {code:'FI', flag:'🇫🇮', name:'Finland',       currency:'EUR'},
  {code:'DE', flag:'🇩🇪', name:'Germany',       currency:'EUR'},
  {code:'GB', flag:'🇬🇧', name:'UK',            currency:'GBP'},
  {code:'US', flag:'🇺🇸', name:'USA',           currency:'USD'},
  {code:'FR', flag:'🇫🇷', name:'France',        currency:'EUR'},
  {code:'ES', flag:'🇪🇸', name:'Spain',         currency:'EUR'},
  {code:'IT', flag:'🇮🇹', name:'Italy',         currency:'EUR'},
  {code:'NL', flag:'🇳🇱', name:'Netherlands',   currency:'EUR'},
  {code:'AU', flag:'🇦🇺', name:'Australia',     currency:'AUD'},
  {code:'CA', flag:'🇨🇦', name:'Canada',        currency:'CAD'},
  {code:'IN', flag:'🇮🇳', name:'India',         currency:'INR'},
  {code:'BR', flag:'🇧🇷', name:'Brazil',        currency:'BRL'},
  {code:'JP', flag:'🇯🇵', name:'Japan',         currency:'JPY'},
  {code:'PL', flag:'🇵🇱', name:'Poland',        currency:'PLN'},
];"""

c2 = c[:idx] + new_countries + c[end:]
open('src/data/index.js', 'w', encoding='utf-8').write(c2)
print('Countries updated to 17!')

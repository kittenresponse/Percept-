"""Generate a provenance-tagged market indicator JSON report."""
import json
import sys
from pathlib import Path
from client import fetch

COUNTRIES={"Afghanistan":"AFG","China":"CHN","Uzbekistan":"UZB","Turkey":"TUR"}
INDICATORS={"gdp_usd":"NY.GDP.MKTP.CD","inflation_percent":"FP.CPI.TOTL.ZG","trade_percent_gdp":"NE.TRD.GNFS.ZS","population":"SP.POP.TOTL"}
def build():
    report={"title":"Percept World Bank Market Intelligence","notice":"Historical development indicators; not live prices, supplier quotes or shipping costs.","countries":{}}
    for name,country in COUNTRIES.items():
        report["countries"][name]={}
        for label,indicator in INDICATORS.items():
            report["countries"][name][label]=fetch(country,indicator,3)
    return report
if __name__=="__main__":
    target=Path(sys.argv[1] if len(sys.argv)>1 else "worldbank-market-report.json")
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps(build(),indent=2,ensure_ascii=False),encoding="utf-8")
    print(f"Report saved: {target}")

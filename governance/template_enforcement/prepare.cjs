function prepare(record){
 const cells=record?.cells||record?.values||record||{},out={};
 const ids={'ntnWZRauxXNxdysnj78kB':'Archive Drive file ID','HLaeI3iZvwxgl1NNz5mSw':'Archive Drive file ID','s1sUv04ZijCSdAhjyxUS6':'Document type','FeKzdSRoVERpy6p9Odoz7':'Document type','cgvPDBRs8lyAYalsEFW9I':'Document SHA256','byX9VM3dtYefjb09AVWAw':'Document SHA256','JM1m0zWSFhtGmc3QjnvTj':'Archive SHA256','Z0FJWrWdSjAO2W2JmBTfU':'Archive SHA256','ljuf8bl1MaJVQ493ouRTN':'Request ID','SklmdhVAkkVsAIj8nzAT0':'Request ID'};
 for(const [key,v] of Object.entries(cells)){const name=v&&typeof v==='object'&&v.fieldName?v.fieldName:(ids[key]||key);out[name]=v&&typeof v==='object'&&Object.hasOwn(v,'value')?v.value:v;}
 return out;
}
module.exports={prepare};

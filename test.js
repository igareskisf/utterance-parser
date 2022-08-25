/**
 * Only for testing purposes
 */

try {
  const tag = 'test-tag';
  // const idealLength = 8;

  let result = {};
  result[tag] = [];

  let transcripts = [
    {
      original: "i'm i'm a new new customer",
      short: "new new customer"
    },
    {
      original: "new customer enquiry",
      short: "new customer enquiry"
    },
    {
      original: "enlisting a new customer",
      short: "enlisting new customer"
    },
    {
      original: "new customer",
      short: "new customer"
    }
  ];

  for (let i = 0; i < transcripts.length - 1; i++) {
    const longer = transcripts[i]['short'].split(' ');
    
    for (let j = i + 1; j < transcripts.length; j++) {
      const shorter = transcripts[j]['short'].split(' ');
      const cmpLength = shorter.filter(x => longer.includes(x)).length / shorter.length;

      if (
        shorter.length <= 3 && cmpLength >= 1 ||
        shorter.length > 3 && shorter.length <= 6 && cmpLength >= 0.5 ||
        shorter.length > 6 && cmpLength >= 0.4
      ) {            
        transcripts = transcripts.filter(x => x['short'] !== transcripts[j]['short']);
      }          
    }
  }
  
  result[tag] = result[tag].concat(transcripts);
  console.log(result);
} catch(e) {
  console.error(e);
}
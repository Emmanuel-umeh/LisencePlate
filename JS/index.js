const contractSource = `
payable contract ParkingLot =   
type i = int
type s = string
type a = address

record car = {
    id : i,
    owner : a,
    nameOfCar	  : s,
    nameOfOwner : s,
    lisencePlate	  : s,
    entryDate : i,
    exitDate : i
     }

record state = 
    { cars : map(i, car),
    totalCars : i}

entrypoint init() = {
    cars = {},
    totalCars = 0 }

entrypoint getCar(index : i) : car = 
    switch(Map.lookup(index, state.cars))
        None  => abort("There is no Cars with that ID.")
        Some(x) => x  

stateful entrypoint addPlayer(nameOfCar' : s,nameOfOwner' : s, lisencePlate' : s) = 
   
    let index = getTotalCars() + 1
    let car = {id= index,  owner  = Call.caller, nameOfCar = nameOfCar', nameOfOwner = nameOfOwner',lisencePlate =  lisencePlate', entryDate = Chain.timestamp, exitDate = 0  }
    put(state {cars[index] = car, totalCars = index})

stateful entrypoint checkOut(index : i) = 
    Chain.spend(Contract.address, 100000)
    let carToCheckOut = getCar(index)
    let updateDate = state.cars[index].entryDate
    put(state{cars[index].exitDate = updateDate + Chain.block_height  })

entrypoint getTotalCars() : i = 
    state.totalCars

    
// payable stateful entrypoint play(index : i, prize : i) =
//     let detail = getPlayer(index)
//     Chain.spend(detail.owner, prize)
//     let updatedPrize = detail.amountWon + prize
//     let updatedDetails = state.players{ [index].amountWon = updatedPrize }
//     put(state{ players = updatedDetails })

`;
const contractAddress ='ct_8b3NePSt93LaBWWuRmNQLwMzxwp3NS9afoMuf89rkH9LrhPEm';
var client = null;
var CarArray = [];


function renderCars() {
//   CarArray = CarArray.sort((x, y) => y.Amount - x.Amount);
  let template = $('#template').html();
  Mustache.parse(template);
  let rendered = Mustache.render(template, {CarArray});
  $('#articlesBody').html(rendered);
}

async function callStatic(func, args) {
  //Create a new contract instance that we can interact with
  const contract = await client.getContractInstance(contractSource, {
    contractAddress
  });

  const calledGet = await contract
    .call(func, args, {
      callStatic: true
    })
    .catch(e => console.error(e));

  const decodedGet = await calledGet.decode().catch(e => console.error(e));
  console.log("number of posts : ", decodedGet);
  return decodedGet;
}

async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {
    contractAddress
  });
  //Make a call to write smart contract func, with aeon value input
  const calledSet = await contract
    .call(func, args, {
      amount: value
    })
    .catch(e => console.error(e));

  return calledSet;
}

window.addEventListener('load', async () => {
//   $("#loader").show();

  client = await Ae.Aepp();

  totalCar =  await callStatic('getTotalCars', [])
  console.log(totalCar)

  for (let i = 1; i <= totalCar; i++) {

   
    const car = await callStatic('getCar', [i])
    console.log(car)

    CarArray.push({
      id     : car.id,
      owner           : car.owner,
      nameOfCar          : car.nameOfCar,
      nameOfOwner          : car.nameOfCar,
      lisencePlate            :car.lisencePlate,
      entryDate: car.entryDate,
      exitDate : car.exitDate
    })
  }

  renderCars();

//   $("#loader").hide();
});

// jQuery("#articlesBody").on("click", ".appreciateBtn", async function(event){
//   $("#loader").show();
//   let value = $(this).siblings('input').val(),
//       index = event.target.id;

//   await contractInstance.methods.appreciateArticle(index, { amount: value }).catch(console.error);
//   await contractCall('appreciateArticle', [index], value )

//   const foundIndex = CarArray.findIndex(article => article.index == event.target.id);
//   CarArray[foundIndex].Amount += parseInt(value, 10);

  
//   renderCars();
//   $("#loader").hide();
// });

// $('#publishBtn').click(async function(){
//   console.log("clicked submit")
//   $("#loader").show();
//   const title = ($('#title').val()),
//     	  name = ($('#name').val()),
//     	  article = ($('#info').val()),
//         caption = ($('#caption').val());

//   // await contractInstance.methods.publishArticle(title, name, article, caption);
//   await contractCall('publishArticle', [title, name, article, caption], 0)

//   CarArray.push({
//     articleTitle: title,
//     author: name,
//     article: article,
//     caption: caption,
//     index: CarArray.length+1,
//     amount: 0,
//   });
//   renderCars();
//   $("#loader").hide();
// });
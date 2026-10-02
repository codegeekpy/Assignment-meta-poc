import cors from 'cors';
import express from 'express';
import {WebSocketServer} from 'ws';
import {createServer} from 'http';
import dotenv from 'dotenv';
dotenv.config();
const app =express();
app.use(cors());


app.use(express.json());

const leads =[
    {
  name:'John Doe',
  email:'johndoe@gmail.com',
  phone:'1234567890',
},
{
  name:'Alice smith',
  email:'alicesmith@gmail.com',
  phone:'9876543210',
}
]



// webscocket server
const PORT = 3000;
const server = createServer(app);
const wss = new WebSocketServer( {server} );
server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});
wss.on('connection',(ws)=>{
    console.log('Client connected');
   ws.send(JSON.stringify(leads)); 
});


app.get('/leads',(req,res)=>{
    res.json(leads);
})


app.get('/webhook',(req,res)=>{
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if(mode && token){
        if (mode ==='subscribe' && token ===process.env.ACCESS_TOKEN){
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        }
        else{
            res.sendStatus(403);
        }
    }
})

// app.get('/webhook', (req, res) => {
//     console.log('GET /webhook received');
//     console.log(req.query);

//     res.status(200).send('GET webhook reached');
// });



app.post('/webhook',async (req,res)=>{
    console.log("POST /webhook received");
    console.log('Webhook body:', JSON.stringify(req.body, null, 2));
    if (req.body.object === 'page') {
    const leadgenId = req.body.entry[0].changes[0].value.leadgen_id;
    console.log('Leadgen ID:', leadgenId);
    try{
        const leadDetails = await fetchdetails(leadgenId);
        console.log('Lead details:', leadDetails);
        const lead={
            name:String(leadDetails.field_data.find(field => field.name === 'FULL_NAME' || field.name === 'full_name')?.values[0] )|| '',
            email:String(leadDetails.field_data.find(field => field.name === 'EMAIL' || field.name === 'email')?.values[0] )|| '',
            phone:String(leadDetails.field_data.find(field => (field.name === 'PHONE_NUMBER' || field.name === 'phone_number' || field.name=== 'phone' || field.name=== 'Phone' || field.name=== 'PHONE' ))?.values[0] )|| '',
        }
        console.log('Lead object:', lead);
        leads.push(lead);
        wss.clients.forEach(client => {
            if (client.readyState === 1) { // 1 means OPEN
                client.send(JSON.stringify(leads));
            }
        });
    }
    catch(error){
        console.error('Error fetching lead details:', error);
    }
}
    res.status(200).send('OK');
});




async function fetchdetails(leadgenId){
    try{
        const response =  await fetch(`https://graph.facebook.com/v26.0/${leadgenId}?access_token=${process.env.META_PAGE_ACCESS_TOKEN}`,{
            method:'GET'
        });
        const data = await response.json();
        console.log('Fetched lead details:', data);
        if(data.field_data){
            data.field_data.forEach(field => {
                console.log(`Field Name: ${field.name}, Field Value: ${field.values[0]}`);
            });
            return data;
        }
        
    }
    catch(error){
        console.error('Error fetching lead details:', error);
    }
}
















// const response = await fetch('https://graph.facebook.com/v26.0/1731755694788188/leads?access_token=${process.env.META_PAGE_ACCESS_TOKEN}',{
//     method:'GET',
// })

//the functionality for getting the leads from the meta api and then getting the lead details using the lead id is implemented in the below function. The function is not called anywhere in the code. You can call it wherever you want to get the leads and lead details.
// async function fetchLeads() {
//         try{
//             const response = await fetch(`https://graph.facebook.com/v26.0/1731755694788188/leads?access_token=${process.env.META_PAGE_ACCESS_TOKEN}`, {
//                 method: 'GET',
//             });
//             const data = await response.json();
//             // console.log('Fetched leads:', data);
        
//             const leadIds = data.data.map(lead => lead.id);
//             console.log('From Graph Api Fetched lead IDs:', leadIds);
//             try{
//                 const leadDetailsResponse = await fetch(`https://graph.facebook.com/v26.0/${leadIds[0]}?access_token=${process.env.META_PAGE_ACCESS_TOKEN}`, {
//                     method: 'GET',
//                 });
//                 const leadDetails = await leadDetailsResponse.json();
//                 console.log('Fetched lead details:', leadDetails);
//             }
//             catch(error){
//                 console.error('Error fetching lead details:', error);
//             }
//         }
//         catch(error){
//             console.error('Error fetching leads:', error);
//         }
// }
// // fetchLeads();




// async function getLeadIds(){
//     try{
//         const response = await fetch(`https://graph.facebook.com/v26.0/me/leadgen_forms?access_token=${process.env.META_PAGE_ACCESS_TOKEN}`, {
//             method: 'GET',
//         });
//         const data = await response.json();
//         const formIds = data.data.map(form => form.id);
//         console.log('From Graph Api Fetched form IDs:', formIds);
//     }
//     catch(error){
//         console.error('Error fetching form IDs:', error);
//     }
// }
// // getLeadIds();
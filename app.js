require('dotenv').config()

const { createBot, createProvider, createFlow, addKeyword, EVENTS  } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MySQLAdapter = require('@bot-whatsapp/database/mysql')


const flowPrincipal  = addKeyword(EVENTS.WELCOME)
    .addAnswer(['Hola! soy el asistente virtual del servicio de Reclamos Iars2!.😎'
                ,'Soy un asistente creado con Inteligencia Artificial preparado para atender a tus necesidades'
                ,'Puedes indicar tu situación, y gestionaremos correctamente para dar una respuesta oportuna'],
    {capture : true},
    async(ctx,{flowDynamic, fallBack, provider}) => {
        //console.log(ctx)

                var myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                var raw = JSON.stringify({
                    "message": ctx.body,
                    "typemessage": "Whatsapp",
                    "valuetype": ctx.from,
                    "enterprise": process.env.ENTERPRISE
                });
                
                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: raw,
                    redirect: 'follow'
                  };
                  
                let response = await fetch('http://' + process.env.IP_APIREST + '/enviareclamo/', requestOptions);
            result = await response.json();
            resultado = await result.respuesta;

            flowDynamic([
                {
                    body: resultado
                }
            ])
    }
)


const main = async () => {
    const adapterDB = new MySQLAdapter({
        host: process.env.MYSQL_DB_HOST,
        user: process.env.MYSQL_DB_USER,
        database: process.env.MYSQL_DB_NAME,
        password: process.env.MYSQL_DB_PASSWORD,
        port: process.env.MYSQL_DB_PORT,
    })
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()

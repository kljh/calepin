import {
	ErrorHandler,
	HandlerInput,
	RequestHandler,
	SkillBuilders,
} from 'ask-sdk-core';

import {
	Response,
	SessionEndedRequest,
} from 'ask-sdk-model';

/*

https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/develop-your-first-skill.html
https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/handle-requests.html
https://developer.amazon.com/en-US/docs/alexa/custom-skills/standard-built-in-intents.html
https://developer.amazon.com/en-US/docs/alexa/custom-skills/host-a-custom-skill-as-an-aws-lambda-function.html
https://developer.amazon.com/en-US/docs/alexa/custom-skills/test-and-debug-a-custom-skill.html

https://gist.github.com/habuma/675a4efb4a657391a4b0159e9fda78f5?permalink_comment_id=4303650

Types of request

 -	LaunchRequest
 -	SessionEndedRequest
 -	IntentRequest

Supported Intent requests :

	AMAZON.HelpIntent	-	Required
	Provides help about how to use the skill.
	Utterances : Help me, Aide-moi (fr)

	AMAZON.CancelIntent	-	Required
	Lets the user cancel a transaction or task (but remain in the skill)
	Utterances : Cancel, Never mind, Annule (fr)

	AMAZON.StopIntent	-	Required
	Exits the skill.
	Utterances : Stop, Arr�te

	AMAZON.NavigateHomeIntent	-	Required (but with default implementatoin)
	Active only on screen devices where it exits the skill and returns customers to the home screen.
	Utterances : Alexa, go to the home screen

	ComposeNumero
	Dial a phone number from Name.
	Utterances : Alexa, va chercher {AMAZON.FirstName}


*/


// ----- LaunchRequest -----

const LaunchRequestHandler : RequestHandler = {
	canHandle(handlerInput : HandlerInput) : boolean {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'LaunchRequest';
	},
	handle(handlerInput : HandlerInput) : Response {
		const speechText = "Carnet d'adresse ouvert";  // add owner and number of contacts to message

		return handlerInput.responseBuilder
			.speak(speechText)
			.reprompt(speechText)
			.withSimpleCard("Bienvenu dans votre carnet d'adresses", speechText)  // title & text
			.getResponse();
	},
};



// ----- SessionEndedRequestHandler -----

const SessionEndedRequestHandler : RequestHandler = {
	canHandle(handlerInput : HandlerInput) : boolean {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'SessionEndedRequest';
	},
	handle(handlerInput : HandlerInput) : Response {
		console.log(`Session ended with reason: ${(handlerInput.requestEnvelope.request as SessionEndedRequest).reason}`);

		return handlerInput.responseBuilder.getResponse();
	},
};



// ----- IntentRequests -----

const HelpIntentHandler : RequestHandler = {
	canHandle(handlerInput : HandlerInput) : boolean {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest'
			&& request.intent.name === 'AMAZON.HelpIntent';
	},
	handle(handlerInput : HandlerInput) : Response {
		const speechText = 'You can ask me the weather!';

		return handlerInput.responseBuilder
			.speak(speechText)
			.reprompt(speechText)
			.withSimpleCard('You can ask me the weather!', speechText)
			.getResponse();
	},
};

const CancelAndStopIntentHandler : RequestHandler = {
	canHandle(handlerInput : HandlerInput) : boolean {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest'
			&& (request.intent.name === 'AMAZON.CancelIntent'
				 || request.intent.name === 'AMAZON.StopIntent');
	},
	handle(handlerInput : HandlerInput) : Response {
		const speechText = 'Goodbye!';

		return handlerInput.responseBuilder
			.speak(speechText)
			.withSimpleCard('Goodbye!', speechText)
			.withShouldEndSession(true)
			.getResponse();
	},
};


const ListContactsIntentHandler : RequestHandler = {
	canHandle(handlerInput : HandlerInput) : boolean {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest'
			&& request.intent.name === 'ListContacts';
	},
	handle(handlerInput : HandlerInput) : Response {
		console.log("requestEnvelope", handlerInput.requestEnvelope);

		const request = handlerInput.requestEnvelope.request;

        const userId = handlerInput.requestEnvelope.session?.user?.userId;
        const shortId = userId?.split('.')?.pop()?.substr(0,8);
        console.log("userId", userId);
        console.log("shortId", shortId);

        // https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html
        // Use also <say-as interpret-as='telephone'>2025551212</say-as>.
        var speechText = `<speak>Vos contacts : Maman, Manou, Petit Claude, Nicolas. Pour editer vos contacts, allez sur http://app.kljh.org/calepin . Votre identifiant : <say-as interpret-as='spell-out'>${shortId}</say-as> </speak>`;
        var displayText = `Vos contacts : Maman, Manou, Petit Claude, Nicolas.\r\nPour editer vos contacts, allez sur http://app.kljh.org/calepin \r\nVotre identifiant : ${shortId}.`;
		return handlerInput.responseBuilder
			.speak(speechText)
			.withSimpleCard('Mon petit calepin.', displayText)
			.getResponse();
	},
};

const AddContactIntentHandler : RequestHandler = {
	canHandle(handlerInput : HandlerInput) : boolean {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest'
			&& (
				request.intent.name === 'AjouteNumero'
				|| request.intent.name === 'AddContact' );
	},
	handle(handlerInput : HandlerInput) : Response {
		const request = handlerInput.requestEnvelope.request;

		var speechText : string = "Il me manque des infos";
		if (request.type === 'IntentRequest')
		if (request.intent.slots !== undefined)
		{
			var contactName = request.intent.slots["ContactName"].value;
			var contactNumber = request.intent.slots["ContactNumber"].value;
			speechText = `Je rajoute ${contactName} au ${contactNumber}`;
		}

		return handlerInput.responseBuilder
			.speak(speechText)
			.withSimpleCard('Mon petit calepin.', speechText)
			.getResponse();
	},
};

const DialNumberIntentHandler : RequestHandler = {
	canHandle(handlerInput : HandlerInput) : boolean {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest'
			&& (
				request.intent.name === 'AskWeatherIntent'
				|| request.intent.name === 'ComposeNumero'
				|| request.intent.name === 'CallContact'
			);
	},
	async handle(handlerInput : HandlerInput) : Promise<Response> {
		const request = handlerInput.requestEnvelope.request;
		var contactName : string | undefined = "no slot";

		if (request.type === 'IntentRequest')
		if (request.intent.slots !== undefined)
		{
			contactName = request.intent.slots["ContactName"]?.value;
		}

		var speechText = `J'envoie un message \xE0 ${contactName}.`;

		var bSent = await send_text("MonCalepin", 33_781_385459,
			`Bonjour ${contactName}, peux-tu me rappeler ?.`);
		if (!bSent)
			speechText = `Echec de l'envoi du message \xE0 ${contactName}.`;

		return handlerInput.responseBuilder
			.speak(speechText)
			.withSimpleCard('Mon petit calepin.', speechText)
			.getResponse();
	},
};

const DialRecentIntentHandler : RequestHandler = {
	canHandle(handlerInput : HandlerInput) : boolean {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest'
			&& ( request.intent.name === 'ComposeRecent'
			|| request.intent.name === 'CallAgain' ) ;
	},
	handle(handlerInput : HandlerInput) : Response {
		const request = handlerInput.requestEnvelope.request;
		const speechText = `Je recompose le numero.`;

		return handlerInput.responseBuilder
			.speak(speechText)
			.withSimpleCard('Mon petit calepin.', speechText)
			.getResponse();
	},
};

const YesIntentHandler : RequestHandler = {
    canHandle(handlerInput : HandlerInput) : boolean {
        const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest'
            && request.intent.name === 'AMAZON.YesIntent';
    },
    handle(handlerInput : HandlerInput) : Response {
		// we lookup what was the previous prompt/question by Alexa (saved with setQuestion()
		if (handlerInput.attributesManager.getSessionAttributes().questionAsked === 'RedialLastNumber')
		{
			// When handling the yes and no intents, be sure to clear out the session attribute to avoid a mishandling of subsequent yes/no.
			setQuestion(handlerInput, undefined);
		}

        return handlerInput.responseBuilder
			.speak("J'appelle")
			// .withSimpleCard('The weather today is sunny.', speechText)
			.getResponse();
    }
}

const NoIntentHandler : RequestHandler = {
    canHandle(handlerInput : HandlerInput) : boolean {
        const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest'
            && request.intent.name === 'AMAZON.NoIntent';
    },
    handle(handlerInput : HandlerInput) : Response {
        return handlerInput.responseBuilder
			.speak("Ok")
			// .withSimpleCard('The weather today is sunny.', speechText)
			.getResponse();
    }
}

function setQuestion(handlerInput : HandlerInput, questionAsked? : string) : void {
	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
	sessionAttributes.questionAsked = questionAsked;
	handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}


// ----- Error Handler -----

const ErrorHandler : ErrorHandler = {
	canHandle(handlerInput : HandlerInput, error : Error ) : boolean {
		return true;
	},
	handle(handlerInput : HandlerInput, error : Error) : Response {
		console.log(`Error handled: ${error.message}`);
		console.log(`Error stack: ${error.stack}`);

		const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
		const speechText = 'Sorry, I don\'t comprendre your command. Please say it again.';
		// requestAttributes.t('ERROR_MESSAGE') requestAttributes.t is not a function

		return handlerInput.responseBuilder
			.speak(speechText)
			.withSimpleCard('Mon petit calepin.', error.message)
			.reprompt(speechText)
			.getResponse();
	}
};


// sender: "MonCalepin",
// recipient: 33781385459
// message: `Bonjour ${contactName}, peux-tu me rappeler ?.`,
async function send_text(sender: string, recipient : number, message: string) {
	// https://gatewayapi.com/docs/apis/rest/

	// URL json or encoded (below)
	// curl -v "https://gatewayapi.eu/rest/mtsms" -u "%apigateway_token%": -d sender="MonCalepin"
	//  -d message="Hello World" -d recipients.0.msisdn=33781385459

	const url = "https://gatewayapi.eu/rest/mtsms";
    const token = process.env.GATEWAYAPI_TOKEN;
	const response = await fetch(url, {
		method: 'POST',
		body: JSON.stringify({
			sender,
			message,
			"recipients": [ { "msisdn": recipient } ]
		}),
		headers: {
			'Content-Type': 'application/json',
			"Authorization": `Token ${token}`,
		}
	});

	if (!response.ok) { /* Handle */ }
	if (response.body !== null) { }
	return response.ok;
}

export var handler = SkillBuilders.custom()
	.addRequestHandlers(
		LaunchRequestHandler,
		ListContactsIntentHandler,
		AddContactIntentHandler,
		DialNumberIntentHandler,
		DialRecentIntentHandler,
		YesIntentHandler,
		NoIntentHandler,
		HelpIntentHandler,
		CancelAndStopIntentHandler,
		SessionEndedRequestHandler,
	)
	.addErrorHandlers(ErrorHandler)
	.lambda();

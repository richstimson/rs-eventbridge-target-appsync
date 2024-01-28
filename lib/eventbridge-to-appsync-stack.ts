import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { createAppSyncAPI } from './api/appsync'
import { createEventBridge } from './choreography/evenbridge'
import { publishMsgFromEB } from './api/src/graphql/mutations'
import { CfnGraphQLApi } from 'aws-cdk-lib/aws-appsync'
export class EventbridgeToAppsyncStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		const api = createAppSyncAPI(this, {
			appName: 'eventbridge-to-appsync',
		})

		const cfnAPI = api.node.defaultChild as CfnGraphQLApi

		const eventBridge = createEventBridge(this, {
			busName: 'eb-appsync-bus',
			appsyncApiArn: api.arn,
			appsyncEndpointArn: cfnAPI.attrGraphQlEndpointArn,
			graphQlOperation: publishMsgFromEB,
		})
		//arn:aws:appsync:::apis/apiId
		new cdk.CfnOutput(this, 'appsync-api-url', {
			value: api.graphqlUrl,
		})
		new cdk.CfnOutput(this, 'appsync-api-arn', {
			value: api.arn,
		})

		//arn:aws:appsync:::endpoints/graphql-api/graphQLUrlId
		new cdk.CfnOutput(this, 'cfn-graphql-arn', {
			value: cfnAPI.attrGraphQlEndpointArn,
		})
	}
}

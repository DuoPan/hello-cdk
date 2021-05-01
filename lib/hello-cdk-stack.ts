import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';

export class HelloCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const eckey = new cdk.CfnParameter(this, "eckey", {
      type: "String",
      description: "The key name of EC2."
    });

    // Retrieve default VPC
    const vpc = new ec2.Vpc(this, 'xing-vpc', {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Ingress',
          subnetType: ec2.SubnetType.PUBLIC,
        }
      ]
    });

    // Create a security group for our instance
    const securityGroup = new ec2.SecurityGroup(
      this,
      'xing-instance-1-sg',
      {
        vpc: vpc,
        allowAllOutbound: true,
        securityGroupName: 'xing-instance-1-sg',
      }
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allows SSH access from Internet'
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allows HTTP access from Internet'
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allows HTTPS access from Internet'
    );

    const instance = new ec2.Instance(this, 'xing-instance-1', {
      vpc: vpc,
      securityGroup: securityGroup,
      instanceName: 'xing-instance-1',
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: eckey.valueAsString,
    });
  }
}

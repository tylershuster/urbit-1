import React from "react";
import { Text, LoadingSpinner, Button } from "@tlon/indigo-react";

const ReconnectButton = ({ connection }) => {
  const connectedStatus = connection || "connected";
  const reconnect = () => {}; // TODO how to restart subscriptions?
  // const reconnect = subscription.restart.bind(subscription);

  if (connectedStatus === "disconnected") {
    return (
      <Button onClick={reconnect} borderColor='red' px='2'>
        <Text display={['none', 'inline']} textAlign='middle' color='red'>Reconnect</Text>
        <Text color='red'> ↻</Text>
      </Button>
    );
  } else if (connectedStatus === "reconnecting") {
    return (
      <Button borderColor='yellow' px='2' onClick={() => {}} cursor='default'>
        <LoadingSpinner pr={['0','2']} foreground='scales.yellow60' background='scales.yellow30'/>
        <Text display={['none', 'inline']} textAlign='middle' color='yellow'>Reconnecting</Text>
      </Button>
    )
  } else {
    return null;
  }
};

export default ReconnectButton;

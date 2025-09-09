"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, DollarSign, Clock, User, Shield } from "lucide-react";

interface NegotiationMessage {
  id: string;
  sender: 'admin' | 'seller';
  message: string;
  timestamp: string;
  type: 'message' | 'offer' | 'counter_offer' | 'accept' | 'reject';
  amount?: number;
}

interface NegotiationChatProps {
  listingId: string;
  sellerId: string;
  currentOffer?: number;
  onOfferUpdate?: (offer: number) => void;
  onAccept?: () => void;
  onReject?: () => void;
  isAdmin?: boolean;
}

export function NegotiationChat({ 
  listingId, 
  sellerId, 
  currentOffer,
  onOfferUpdate,
  onAccept,
  onReject,
  isAdmin = false 
}: NegotiationChatProps) {
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newOffer, setNewOffer] = useState(currentOffer?.toString() || "");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock initial messages
  useEffect(() => {
    const mockMessages: NegotiationMessage[] = [
      {
        id: "1",
        sender: 'seller',
        message: "Hi, I've submitted my BGMI account for review. My asking price is ₹150.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: 'offer',
        amount: 150
      },
      {
        id: "2",
        sender: 'admin',
        message: "Thank you for your submission. I've reviewed your account and would like to make a counter-offer.",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        type: 'message'
      },
      {
        id: "3",
        sender: 'admin',
        message: "Based on current market conditions and account value, I can offer ₹120.",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        type: 'counter_offer',
        amount: 120
      }
    ];
    setMessages(mockMessages);
  }, [listingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      const message: NegotiationMessage = {
        id: Date.now().toString(),
        sender: isAdmin ? 'admin' : 'seller',
        message: newMessage,
        timestamp: new Date().toISOString(),
        type: 'message'
      };

      setMessages(prev => [...prev, message]);
      setNewMessage("");
      
      // TODO: Implement API call to send message
      console.log("Sending message:", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeOffer = async () => {
    if (!newOffer || isNaN(parseFloat(newOffer))) return;

    setIsLoading(true);
    try {
      const message: NegotiationMessage = {
        id: Date.now().toString(),
        sender: isAdmin ? 'admin' : 'seller',
        message: isAdmin ? `I'm making a counter-offer of ₹${newOffer}` : `I'm accepting your offer of ₹${newOffer}`,
        timestamp: new Date().toISOString(),
        type: isAdmin ? 'counter_offer' : 'accept',
        amount: parseFloat(newOffer)
      };

      setMessages(prev => [...prev, message]);
      
      if (onOfferUpdate) {
        onOfferUpdate(parseFloat(newOffer));
      }
      
      // TODO: Implement API call to make offer
      console.log("Making offer:", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const message: NegotiationMessage = {
        id: Date.now().toString(),
        sender: isAdmin ? 'admin' : 'seller',
        message: "I accept this offer. Let's proceed with the transaction.",
        timestamp: new Date().toISOString(),
        type: 'accept'
      };

      setMessages(prev => [...prev, message]);
      
      if (onAccept) {
        onAccept();
      }
      
      // TODO: Implement API call to accept offer
      console.log("Accepting offer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const message: NegotiationMessage = {
        id: Date.now().toString(),
        sender: isAdmin ? 'admin' : 'seller',
        message: "I'm rejecting this offer. Thank you for your time.",
        timestamp: new Date().toISOString(),
        type: 'reject'
      };

      setMessages(prev => [...prev, message]);
      
      if (onReject) {
        onReject();
      }
      
      // TODO: Implement API call to reject offer
      console.log("Rejecting offer");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'offer':
      case 'counter_offer':
        return <DollarSign className="h-4 w-4" />;
      case 'accept':
        return <Shield className="h-4 w-4" />;
      case 'reject':
        return <Clock className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'offer':
      case 'counter_offer':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'accept':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'reject':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
          Negotiation Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="h-64 overflow-y-auto space-y-3 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${message.sender === 'admin' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-center space-x-2 mb-1 ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <Badge className={`${getMessageTypeColor(message.type)} text-xs`}>
                    {getMessageTypeIcon(message.type)}
                    <span className="ml-1">
                      {message.sender === 'admin' ? 'Admin' : 'Seller'}
                    </span>
                  </Badge>
                  <span className="text-gray-400 text-xs">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === 'admin'
                      ? 'bg-blue-500/20 text-blue-100'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  {message.amount && (
                    <div className="mt-2 pt-2 border-t border-gray-600">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="font-semibold text-green-400">₹{message.amount}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Current Offer Display */}
        {currentOffer && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-green-400 font-medium">Current Offer</span>
              </div>
              <span className="text-white font-bold text-lg">₹{currentOffer}</span>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !newMessage.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Offer Input (Admin Only) */}
          {isAdmin && (
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Enter counter-offer amount..."
                value={newOffer}
                onChange={(e) => setNewOffer(e.target.value)}
                className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
              <Button
                onClick={handleMakeOffer}
                disabled={isLoading || !newOffer || isNaN(parseFloat(newOffer))}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Make Offer
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={handleAccept}
              disabled={isLoading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Accept Offer
            </Button>
            <Button
              onClick={handleReject}
              disabled={isLoading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              <Clock className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

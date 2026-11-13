"use strict";

let socketServer;

exports.setSocketServer = (server) => {
  socketServer = server;
};

exports.emitRiderOrderReady = (order) => {
  socketServer?.to("riders:available").emit("rider:order-ready", {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
  });
};

exports.emitRiderOrderUpdated = (order, previousRiderId = null) => {
  const payload = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    riderId: order.riderId,
  };
  const assignedRoom = order.riderId == null ? null : `rider:${order.riderId}`;
  if (assignedRoom) {
    socketServer
      ?.to("riders:available")
      .except(assignedRoom)
      .emit("rider:order-updated", payload);
    socketServer?.to(assignedRoom).emit("rider:order-updated", payload);
  } else {
    socketServer?.to("riders:available").emit("rider:order-updated", payload);
  }
  if (previousRiderId != null && Number(previousRiderId) !== Number(order.riderId)) {
    socketServer?.to(`rider:${previousRiderId}`).emit("rider:order-updated", payload);
  }
};

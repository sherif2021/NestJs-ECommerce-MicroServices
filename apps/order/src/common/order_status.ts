export enum OrderStatus {
    waitingForAdminApproved = 'waiting for admin approved',
    approved = 'approved',
    readyToShip = 'ready to ship',
    shipped = 'shipped',
    delivered = 'delivered',
    reactedFromClient = 'reacted from client',
    completed = 'completed',
}

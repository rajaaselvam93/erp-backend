const logAudit = (userId: number, action: string, metadata: any = {}) => {
  console.log(`[AUDIT] user=${userId} action=${action}`, JSON.stringify(metadata));
};

export default { logAudit };

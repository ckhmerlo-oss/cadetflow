export type SubmissionPermissionBand = {
  minRoleLevel: number
  allowed: boolean
}

export function incidentSubmissionErrorMessage(): string {
  return 'Your role is not authorized to file Incident Reports. Contact your Company TAC or Commandant\'s Office.'
}

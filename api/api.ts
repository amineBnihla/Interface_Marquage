import {api} from "@/api/index"
import { getSessionCookie, removeCookie, setSessionCookie } from "@/lib/cookiesSetting"
import { headers } from "next/headers"
// Types for API responses
export interface Poste {
  numposte: string
}

export interface LigneMarquage {
  idligne_marquage: number
  numlig: string
  numposte: string
  id_emballage: number
  code_emballage: string
  nom_emballage: string
  id_marque: number
  code_marque: string
  nom_marque: string
  id_calibre: number
  code_calibre: string
  traitement: string
  numpo: string
  poids: number
  imprimercalibre: number
  codebarre: string
  listedespas: string
  diametre: string
  nbrfruit: string
}

export interface Etiquette {
  idtabetq: number
  nom: string
}

export interface Versement {
  numver: string
  code_producteur: string
  nom_producteur: string
  nom_sous_variete: string
  nom_variete: string
  dte_versement: string
  debut_versement: string
}

export interface Client {
  idclfin: number
  code_client: string
  nom_client: string
}

export interface Calibre {
  idcalib: number
  calibr: number
  codcal: string
}

export async function fetchPostes(): Promise<Poste[]> {
 
  const res = await api.post('packone/api/marquage/get_postes', {});
  if (res.status !== 200) throw new Error('Failed to fetch postes');
  return res.data;
}

export async function fetchSortiesByPoste(postes: string[]): Promise<LigneMarquage[]> {
   
  const res = await api.post('packone/api/marquage/get_lignes_by_poste',{  numposte: postes});
  if (res.status !== 200) throw new Error('Failed to fetch sorties');
  return res.data;
}

export async function fetchVersements(): Promise<Versement[]> {
   
  const res = await api.post('packone/api/marquage/get_versement',{});
  if (res.status !== 200) throw new Error('Failed to fetch versements');
  return res.data;
}

export async function fetchClients(): Promise<Client[]> {
  
  const res = await api.post('packone/api/marquage/get_clients',{});
  if (res.status !== 200) throw new Error('Failed to fetch clients');
  return res.data;
}

export async function fetchEtiquettes(clientIds: number[]): Promise<Etiquette[]> {
    
  const res = await api.post('packone/api/marquage/get_etiquettes', {
    idclfin: clientIds,
  });
  if (res.status !== 200) throw new Error('Failed to fetch etiquettes');
  return res.data;
}

export async function fetchCalibres(): Promise<Calibre[]> {
 
  const res = await api.post('packone/api/marquage/get_calibre',{});
  if (res.status !== 200) throw new Error('Failed to fetch calibres');
  return res.data;
}

export async function updateLigneCalibre(params: {
  idligne_marquage: number;
  idcalib: number;
  nbrfruit?: number;
}): Promise<{ message: string }> {
  
  const res = await api.post('packone/api/marquage/update_ligne', params);
  if (res.status !== 200) throw new Error('Failed to update ligne calibre');
  return res.data;
}



export async function generateEtiquette(params: any) {
    
     try{
       
       const res = await api.post('packone/api/marquage/generate_etiquette', params);
       if (res.status !== 200) throw new Error('Failed to generate Ettiquete');
       return {success:true,message:"Ettiquette genrated successfully",data:res.data};
     }catch(error){
   return {success:false,message:error?.response?.data.message || "Ettiquette genrated successfully"};
     }
}

export async function loginUser({username,password}:{username:string,password:string}){
    console.log(username)
try{
  const res = await api.post('packone/api/auth',{loginOrMail:username,password});
  if (res.status !== 200) {
    return {succuss:false,message:"Failed to logged in"}
  }
  console.log(res.headers)
  const authToken = res.headers['authorization'];
await setSessionCookie(authToken)
 
  return  {success:true,data:res.data};

}catch(error){
  console.log(error)
   return {succuss:false,message: error?.response.data.message || "Something went wrong"}
}

}

export async function logoutUser(){
 
    await removeCookie()

}
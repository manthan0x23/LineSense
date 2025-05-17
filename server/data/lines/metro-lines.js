import { metroStationData } from "../metro-stations.js";
import { metroLinesColor } from "../metro-util.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function readJsonArrayFile(filename) {
  const filePath = path.join(__dirname, filename);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    if (!Array.isArray(data)) {
      throw new Error("JSON data is not an array");
    }
    return data;
  } catch (err) {
    return `Error reading or parsing file: ${err.message}`;
  }
}


export const metroLines = [
  {
    name: "Delhi Metro Red Line",
    id: 1,
    fs: "red-line.json",
    color: metroLinesColor.Red,
    stations: [
      metroStationData.Rithala_Red,
      metroStationData.RohiniWest_Red,
      metroStationData.RohiniEast_Red,
      metroStationData.Pitampura_Red,
      metroStationData.KohatEnclave_Red,
      metroStationData.NetajiSubhashPlace_Red,
      metroStationData.KeshavPuram_Red,
      metroStationData.KanhaiyaNagar_Red,
      metroStationData.Inderlok_Red,
      metroStationData.ShastriNagar_Red,
      metroStationData.PratapNagar_Red,
      metroStationData.Pulbangash_Red,
      metroStationData.TisHazari_Red,
      metroStationData.KashmereGate_Red,
      metroStationData.ShastriPark_Red,
      metroStationData.Seelampur_Red,
      metroStationData.Welcome_Red,
      metroStationData.Shahdara_Red,
      metroStationData.MansarovarPark_Red,
      metroStationData.Jhilmil_Red,
      metroStationData.DilshadGarden_Red,
      metroStationData.ShaheedNagar_Red,
      metroStationData.RajBagh_Red,
      metroStationData.MajorMohanSharma_Red,
      metroStationData.ShyamPark_Red,
      metroStationData.MohanNagar_Red,
      metroStationData.Arthala_Red,
      metroStationData.HindonRiver_Red,
      metroStationData.ShaheedSthal_Red,
    ],
    start: metroStationData.Rithala_Red,
    end: metroStationData.ShaheedSthal_Red,
  },
  {
    name: "Delhi Metro Yellow Line",
    id: 2,
    fs: "yellow-line.json",
    color: metroLinesColor.Yellow,
    stations: [
      metroStationData.SamaypurBadli_Yellow,
      metroStationData.RohiniSector1819_Yellow,
      metroStationData.HaiderpurBadliMor_Yellow,
      metroStationData.Jahangirpuri_Yellow,
      metroStationData.AdarshNagar_Yellow,
      metroStationData.Azadpur_Yellow,
      metroStationData.ModelTown_Yellow,
      metroStationData.GTBNagar_Yellow,
      metroStationData.VishwaVidyalaya_Yellow,
      metroStationData.VidhanSabha_Yellow,
      metroStationData.CivilLines_Yellow,
      metroStationData.KashmereGate_Yellow,
      metroStationData.ChandniChowk_Yellow,
      metroStationData.ChawriBazar_Yellow,
      metroStationData.NewDelhi_Yellow,
      metroStationData.RajivChowk_Yellow,
      metroStationData.PatelChowk_Yellow,
      metroStationData.CentralSecretariat_Yellow,
      metroStationData.UdyogBhawan_Yellow,
      metroStationData.LokKalyanMarg_Yellow,
      metroStationData.JorBagh_Yellow,
      metroStationData.INA_Yellow,
      metroStationData.AIIMS_Yellow,
      metroStationData.GreenPark_Yellow,
      metroStationData.HauzKhas_Yellow,
      metroStationData.MalviyaNagar_Yellow,
      metroStationData.Saket_Yellow,
      metroStationData.QutubMinar_Yellow,
      metroStationData.Chhatarpur_Yellow,
      metroStationData.Sultanpur_Yellow,
      metroStationData.Ghitorni_Yellow,
      metroStationData.ArjanGarh_Yellow,
      metroStationData.GuruDronacharya_Yellow,
      metroStationData.Sikandarpur_Yellow,
      metroStationData.MGRoad_Yellow,
      metroStationData.IFFCOChowk_Yellow,
      metroStationData.HUDACityCentre_Yellow,
    ],
    start: metroStationData.SamaypurBadli_Yellow,
    end: metroStationData.HUDACityCentre_Yellow,
  },
  {
    name: "Delhi Metro Magenta Line",
    id: 3,
    fs: "magenta-line.json",
    color: metroLinesColor.Magenta,
    stations: [
      metroStationData.janakpuriWest_Magenta,
      metroStationData.dabriMorJanakpuriSouth_Magenta,
      metroStationData.dashrathpuri_Magenta,
      metroStationData.palam_Magenta,
      metroStationData.sadarBazaarCantonment_Magenta,
      metroStationData.terminal1IgiAirport_Magenta,
      metroStationData.shankarVihar_Magenta,
      metroStationData.vasantVihar_Magenta,
      metroStationData.munirka_Magenta,
      metroStationData.rkPuram_Magenta,
      metroStationData.iitDelhi_Magenta,
      metroStationData.hauzKhas_Magenta,
      metroStationData.panchsheelPark_Magenta,
      metroStationData.chiragDelhi_Magenta,
      metroStationData.greaterKailash_Magenta,
      metroStationData.nehruEnclave_Magenta,
      metroStationData.kalkajiMandir_Magenta,
      metroStationData.okhlaNsic_Magenta,
      metroStationData.sukhdevVihar_Magenta,
      metroStationData.jamiaMilliaIslamia_Magenta,
      metroStationData.okhlaVihar_Magenta,
      metroStationData.jasolaViharShaheenBagh_Magenta,
      metroStationData.kalindiKunj_Magenta,
      metroStationData.okhlaBirdSanctuary_Magenta,
      metroStationData.botanicalGarden_Magenta,
    ],
    start: metroStationData.janakpuriWest_Magenta,
    end: metroStationData.botanicalGarden_Magenta,
  },
];

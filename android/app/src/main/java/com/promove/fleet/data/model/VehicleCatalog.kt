package com.promove.fleet.data.model

data class CatalogModel(
    val name: String,
    val defaultType: VehicleType = VehicleType.TROTRO
)

data class CatalogMake(
    val make: String,
    val popularTypes: List<VehicleType>,
    val models: List<CatalogModel>
)

object CuratedVehicleCatalog {
    val makes: List<CatalogMake> = listOf(
        CatalogMake(
            make = "Toyota",
            popularTypes = listOf(VehicleType.TROTRO, VehicleType.TAXI, VehicleType.BUS, VehicleType.TRUCK, VehicleType.PICKUP),
            models = listOf(
                CatalogModel("HiAce (Commuter / 15-Seater)", VehicleType.TROTRO),
                CatalogModel("HiAce (GL / High Roof)", VehicleType.TROTRO),
                CatalogModel("TownAce", VehicleType.TROTRO),
                CatalogModel("LiteAce", VehicleType.TROTRO),
                CatalogModel("Coaster (30-Seater)", VehicleType.BUS),
                CatalogModel("Corolla", VehicleType.TAXI),
                CatalogModel("Yaris", VehicleType.TAXI),
                CatalogModel("Vitz", VehicleType.TAXI),
                CatalogModel("Camry", VehicleType.TAXI),
                CatalogModel("Prius", VehicleType.TAXI),
                CatalogModel("Passo", VehicleType.TAXI),
                CatalogModel("Belta", VehicleType.TAXI),
                CatalogModel("Probox", VehicleType.OTHER),
                CatalogModel("Succeed", VehicleType.OTHER),
                CatalogModel("Hilux", VehicleType.PICKUP),
                CatalogModel("Dyna", VehicleType.TRUCK),
                CatalogModel("ToyoAce", VehicleType.TRUCK),
                CatalogModel("Land Cruiser Pickup", VehicleType.PICKUP)
            )
        ),
        CatalogMake(
            make = "Hyundai",
            popularTypes = listOf(VehicleType.TAXI, VehicleType.TROTRO, VehicleType.BUS, VehicleType.TRUCK),
            models = listOf(
                CatalogModel("i10 / Grand i10", VehicleType.TAXI),
                CatalogModel("Accent", VehicleType.TAXI),
                CatalogModel("Elantra", VehicleType.TAXI),
                CatalogModel("Atos", VehicleType.TAXI),
                CatalogModel("Getz", VehicleType.TAXI),
                CatalogModel("H-100 / Grace", VehicleType.TROTRO),
                CatalogModel("Porter II", VehicleType.TRUCK),
                CatalogModel("Starex / H-1", VehicleType.TROTRO),
                CatalogModel("County", VehicleType.BUS),
                CatalogModel("Universe (Intercity)", VehicleType.BUS)
            )
        ),
        CatalogMake(
            make = "Mercedes-Benz",
            popularTypes = listOf(VehicleType.TROTRO, VehicleType.BUS, VehicleType.TRUCK),
            models = listOf(
                CatalogModel("Sprinter 208D / 312D / 313 (T1N)", VehicleType.TROTRO),
                CatalogModel("Sprinter 314 / 316 / 515 (NCV3)", VehicleType.TROTRO),
                CatalogModel("Sprinter 519 (22-Seater)", VehicleType.BUS),
                CatalogModel("Vario 614D / 814D", VehicleType.BUS),
                CatalogModel("207D / 307D / 308D (Classic Trotro)", VehicleType.TROTRO),
                CatalogModel("Actros (Tipper / Haulage)", VehicleType.TRUCK),
                CatalogModel("Atego (Medium Haulage)", VehicleType.TRUCK),
                CatalogModel("Axor", VehicleType.TRUCK)
            )
        ),
        CatalogMake(
            make = "Nissan",
            popularTypes = listOf(VehicleType.TROTRO, VehicleType.TAXI, VehicleType.TRUCK, VehicleType.PICKUP),
            models = listOf(
                CatalogModel("Urvan / Caravan", VehicleType.TROTRO),
                CatalogModel("NV350 Urvan", VehicleType.TROTRO),
                CatalogModel("Civilian", VehicleType.BUS),
                CatalogModel("Versa / Latio", VehicleType.TAXI),
                CatalogModel("Sentra / Sunny", VehicleType.TAXI),
                CatalogModel("March / Micra", VehicleType.TAXI),
                CatalogModel("Tiida", VehicleType.TAXI),
                CatalogModel("Hardbody / Navara", VehicleType.PICKUP),
                CatalogModel("Atlas / Cabstar", VehicleType.TRUCK)
            )
        ),
        CatalogMake(
            make = "Kia",
            popularTypes = listOf(VehicleType.TAXI, VehicleType.TROTRO, VehicleType.TRUCK),
            models = listOf(
                CatalogModel("Picanto / Morning", VehicleType.TAXI),
                CatalogModel("Rio", VehicleType.TAXI),
                CatalogModel("Forte / Cerato", VehicleType.TAXI),
                CatalogModel("Bongo III (K2700 / K2500)", VehicleType.TRUCK),
                CatalogModel("Pregio", VehicleType.TROTRO),
                CatalogModel("Granbird", VehicleType.BUS)
            )
        ),
        CatalogMake(
            make = "Suzuki",
            popularTypes = listOf(VehicleType.TAXI, VehicleType.OTHER),
            models = listOf(
                CatalogModel("Alto / 800", VehicleType.TAXI),
                CatalogModel("Swift / Dzire", VehicleType.TAXI),
                CatalogModel("Super Carry (Aboboyaa / Delivery)", VehicleType.OTHER),
                CatalogModel("Every / APV Van", VehicleType.OTHER),
                CatalogModel("S-Presso", VehicleType.TAXI)
            )
        ),
        CatalogMake(
            make = "Sinotruk HOWO",
            popularTypes = listOf(VehicleType.TRUCK),
            models = listOf(
                CatalogModel("HOWO 371 Tipper (10-Wheeler / Quarry)", VehicleType.TRUCK),
                CatalogModel("HOWO A7 Tractor Unit", VehicleType.TRUCK),
                CatalogModel("HOWO T5G Flatbed / Dropside", VehicleType.TRUCK),
                CatalogModel("HOWO Concrete Mixer", VehicleType.TRUCK)
            )
        ),
        CatalogMake(
            make = "DAF",
            popularTypes = listOf(VehicleType.TRUCK),
            models = listOf(
                CatalogModel("CF 75 / 85 Tipper & Flatbed", VehicleType.TRUCK),
                CatalogModel("XF 95 / 105 Haulage Articulator", VehicleType.TRUCK),
                CatalogModel("LF 45 / 55 Distribution Truck", VehicleType.TRUCK)
            )
        ),
        CatalogMake(
            make = "Scania",
            popularTypes = listOf(VehicleType.BUS, VehicleType.TRUCK),
            models = listOf(
                CatalogModel("Marcopolo VIP IV (VIP Jeoun Bus)", VehicleType.BUS),
                CatalogModel("Touring Coach", VehicleType.BUS),
                CatalogModel("P-Series / G-Series Tipper", VehicleType.TRUCK),
                CatalogModel("R-Series Heavy Haulage", VehicleType.TRUCK)
            )
        ),
        CatalogMake(
            make = "Daewoo",
            popularTypes = listOf(VehicleType.TAXI, VehicleType.BUS),
            models = listOf(
                CatalogModel("Matiz", VehicleType.TAXI),
                CatalogModel("Kalos / Gentra", VehicleType.TAXI),
                CatalogModel("BH120 / Royale Coach", VehicleType.BUS)
            )
        ),
        CatalogMake(
            make = "Piaggio / TVS / Bajaj",
            popularTypes = listOf(VehicleType.OTHER),
            models = listOf(
                CatalogModel("Piaggio Ape Cargo (Delivery Tricycle)", VehicleType.OTHER),
                CatalogModel("TVS King Deluxe (Pragya / Tricycle)", VehicleType.OTHER),
                CatalogModel("Bajaj Maxima Z Cargo", VehicleType.OTHER)
            )
        )
    )
}

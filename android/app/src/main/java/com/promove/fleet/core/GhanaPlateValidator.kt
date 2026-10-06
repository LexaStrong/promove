package com.promove.fleet.core

data class GhanaPlateValidationResult(
    val isValid: Boolean,
    val formattedPlate: String,
    val regionCode: String? = null,
    val regionName: String? = null,
    val errorMessage: String? = null
)

object GhanaPlateValidator {
    private val PLATE_REGEX = Regex("""^([A-Z]{2})[\s\-]?([0-9]{1,4})[\s\-]?([0-9]{2})$""")

    fun validate(rawInput: String): GhanaPlateValidationResult {
        val cleaned = rawInput.trim().uppercase()
        if (cleaned.isEmpty()) {
            return GhanaPlateValidationResult(
                isValid = false,
                formattedPlate = "",
                errorMessage = "Please enter a Ghana registration number"
            )
        }

        val match = PLATE_REGEX.matchEntire(cleaned)
        if (match == null) {
            return GhanaPlateValidationResult(
                isValid = false,
                formattedPlate = cleaned,
                errorMessage = "Invalid format. Expected e.g. GW 2412-23 or GR 4512-24"
            )
        }

        val prefix = match.groupValues[1]
        val number = match.groupValues[2]
        val year = match.groupValues[3]

        val region = GhanaRegion.findByCode(prefix)
        if (region == null) {
            return GhanaPlateValidationResult(
                isValid = false,
                formattedPlate = "$prefix $number-$year",
                regionCode = prefix,
                errorMessage = "'$prefix' is not a recognized DVLA region code in Ghana"
            )
        }

        val formatted = "$prefix $number-$year"
        return GhanaPlateValidationResult(
            isValid = true,
            formattedPlate = formatted,
            regionCode = prefix,
            regionName = region.regionName,
            errorMessage = null
        )
    }
}
